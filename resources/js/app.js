import axios from 'axios';
import Noty from 'noty';
import moment from 'moment'

import    { initAdmin  }   from './admin';
 

let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');


addToCart.forEach((btn)=>{
    btn.addEventListener('click', (e)=>{
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
        //console.log(pizza);
    })
})

function updateCart(pizza){
    axios.post('/update-cart', pizza).then(res =>{
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: 'success',
            timeout : 1000,
            text: 'Successfully added in cart'
        }).show();
        //console.log(res)
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout : 1000,
            text: 'Something went wrong'
        }).show();
    })
}



//change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector("#hiddenInput")
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order){
    statuses.forEach((status) =>{
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })

    let stepCompleted = true;
    statuses.forEach((status)=>{
        let dataProp = status.dataset.status
        if(stepCompleted){
            status.classList.add('step-completed')
        }
        if(dataProp===order.status){
            stepCompleted=false;
            time.innerHTML = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
            
        }
    })

}
updateStatus(order)

//socket
let socket = io()
initAdmin(socket)
//join 
if(order){
    socket.emit('join', `order_${order._id}`)
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout : 1000,
        text: 'Status updated....'
    }).show();
    //console.log(data)
})

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
    socket.emit('join', 'adminRoom')
}


