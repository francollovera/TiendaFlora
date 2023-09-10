let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito)



const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("total");
const botonComprar = document.querySelector("#carrito-acciones-comprar")

function cargarProductosCarrito(){

       
    if (productosEnCarrito && productosEnCarrito.length >0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    
       
    
        contenedorCarritoProductos.innerHTML = "";
        
            productosEnCarrito.forEach(producto => {
        
                const div = document.createElement("div");
                div.classList.add("carrito-producto");
                div.innerHTML = `
                    <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                    <div class="carrito-producto-titulo">
                        <small>Título</small>
                        <h3>${producto.titulo}</h3>
                    </div>
                    <div class="carrito-producto-cantidad">
                        <small>Cantidad</small>
                        <p>${producto.cantidad}</p>
                    </div>
                    <div class="carrito-producto-precio">
                        <small>Precio</small>
                        <p>$${producto.precio}</p>
                    </div>
                    <div class="carrito-producto-subtotal">
                        <small>Subtotal</small>
                        <p>$${producto.precio * producto.cantidad}</p>
                    </div>
                    <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
                `;
        
                contenedorCarritoProductos.append(div);
            })
       
    }else{
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
    actualizarBotonesEliminar();
    actualizarTotal();

}
cargarProductosCarrito();


function actualizarBotonesEliminar(){
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar")
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e){
    const idBoton = e.currentTarget.id;
    
    
   const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
   
   productosEnCarrito.splice(index, 1)
   cargarProductosCarrito();

   localStorage.setItem("productos-en-carrito",JSON.stringify(productosEnCarrito))
}
botonVaciar.addEventListener("click", vaciarCarrito)
function vaciarCarrito(){
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito))
    cargarProductosCarrito();
}

function actualizarTotal(){
    const totalCalculado = productosEnCarrito.reduce(( acc , producto) => acc + (producto.precio * producto.cantidad) , 0)
total.innerText = `$${totalCalculado}`;
}

botonComprar.addEventListener("click", vaciarCarrito)
function comprarCarrito(){
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito))

    contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.remove("disabled");
    
    

}

// REPLACE WITH YOUR PUBLIC KEY AVAILABLE IN: https://developers.mercadopago.com/panel
const mercadopago = new MercadoPago('APP_USR-5102c4a1-b24f-4aed-80d0-29d6a0a2ac3f', {
    locale: '<LOCALE>' // The most common are: 'pt-BR', 'es-AR' and 'en-US'
  });
  
  // Handle call to backend and generate preference.
  document.getElementById("checkout-btn").addEventListener("click", function () {
  
    $('#checkout-btn').attr("disabled", true);
  
    const orderData = {
      quantity: document.getElementById("quantity").value,
      description: document.getElementById("product-description").innerHTML,
      price: document.getElementById("unit-price").innerHTML
    };
  
    fetch("http://localhost:8080/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (preference) {
        createCheckoutButton(preference.id);
  
        $(".shopping-cart").fadeOut(500);
        setTimeout(() => {
          $(".container_payment").show(500).fadeIn();
        }, 500);
      })
      .catch(function () {
        alert("Unexpected error");
        $('#checkout-btn').attr("disabled", false);
      });
  });
  
  function createCheckoutButton(preferenceId) {
    // Initialize the checkout
    const bricksBuilder = mercadopago.bricks();
  
    const renderComponent = async (bricksBuilder) => {
      if (window.checkoutButton) window.checkoutButton.unmount();
      await bricksBuilder.create(
        'wallet',
        'button-checkout', // class/id where the payment button will be displayed
        {
          initialization: {
            preferenceId: preferenceId
          },
          callbacks: {
            onError: (error) => console.error(error),
            onReady: () => {}
          }
        }
      );
    };
    window.checkoutButton =  renderComponent(bricksBuilder);
  }
  
  // Handle price update
  function updatePrice() {
    let quantity = document.getElementById("quantity").value;
    let unitPrice = document.getElementById("unit-price").innerHTML;
    let amount = parseInt(unitPrice) * parseInt(quantity);
  
    document.getElementById("cart-total").innerHTML = "$ " + amount;
    document.getElementById("summary-price").innerHTML = "$ " + unitPrice;
    document.getElementById("summary-quantity").innerHTML = quantity;
    document.getElementById("summary-total").innerHTML = "$ " + amount;
  }
  
  document.getElementById("quantity").addEventListener("change", updatePrice);
  updatePrice();
  
  // Go back
  document.getElementById("go-back").addEventListener("click", function () {
    $(".container_payment").fadeOut(500);
    setTimeout(() => {
      $(".shopping-cart").show(500).fadeIn();
    }, 500);
    $('#checkout-btn').attr("disabled", false);
  });
