const Order = require('../../../models/order');
const moment = require('moment');
const { session } = require('passport');

function orderController(){
    return {
        store(req, res){
            //validate request
            const { phone, address } = req.body;
            if(!phone || !address){
                req.flash('error','All fields required');
                return res.redirect('/cart');
            }
            const order = new Order({
                customerId : req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                Order.populate(result, {path: 'customerId'}, (err, placedOrder) => {
                   if(err){
                        console.log(err)
                   }
                    delete req.session.cart;
                    req.flash('success','Order Successfully placed');
                    //Emit event
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder)
                    
                    return res.redirect('/customers/orders');
                })
                
            }).catch(err => {
                req.flash('error','Something went wrong');
                return res.redirect('cart');
            })
        },
        async index(req, res){
            const orders = await Order.find({customerId: req.user._id}, null, { sort : {'createdAt':-1}});
            //console.log(orders);
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')

            res.render('customers/orders', { orders: orders, moment:moment})
        },
        async show(req, res){
           const order = await Order.findById(req.params.id);
           if(order.customerId.toString() === req.user._id.toString()){
               return res.render('customers/singleOrder', {order:order})
           }
           return res.redirect('/')
        }

    }
}

module.exports = orderController;