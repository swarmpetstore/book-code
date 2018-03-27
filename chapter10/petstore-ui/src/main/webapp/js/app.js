var Router = ReactRouter;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;

var clientApiGateway = customerGatewayUrl

function post(path, data, queryParams) {

    for (var qp in queryParams) {
        if (!queryParams.hasOwnProperty(qp)) {
            continue;
        }
        path += "?" + qp + "=" + queryParams[qp];
    }

    var headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    if (keycloak.token != null) {
        headers.set('Authorization', 'Bearer ' + keycloak.token);
    }

    fetch(clientApiGateway + "/" + path, {
        headers: headers,
        method: "POST",
        body: JSON.stringify(data)
    }).catch(function (err) {
        console.log(err.stack);
    });
}

function remove(path) {
    remove(path, {})
}

function remove(path, queryParams) {

    for (var qp in queryParams) {
        if (!queryParams.hasOwnProperty(qp)) {
            continue;
        }
        path+="?"+qp+"="+queryParams[qp]
    }

        var headers = new Headers({
              'Accept': 'application/json',
              'Content-Type': 'application/json'
        });

        if(keycloak.token != null){
            headers.set('Authorization', 'Bearer '+keycloak.token);
        }

    fetch(clientApiGateway+"/"+path,
    {
        headers: headers,
        method: "DELETE",
       }).
        catch(function(err) {
                    console.log(err.stack)
                });
}

var Item = React.createClass({
getInitialState:	function()	{
    return	{ quantity: 1}
  },
    handleChange: function(event) {
      this.setState({quantity: event.target.value});
    },
     onAddToCart: function(event){
    if(keycloak.authenticated){
        var item = this.props.item
        var cartItem = {itemId : item.itemId, quantity: this.state.quantity};
        post("cart/"+userInfo.sub, cartItem,{additive: true});
    } else {
        alert("You must be logged in to add the item to the cart");
    }
        event.preventDefault();
      },
  render: function() {
    var item = this.props.item
    return (
<div className="col-md-3">
<div className="pet-grid">
    <div className="row">

            <h3>{item.name}</h3>
        </div>
    <div className="row">
        <p className="description">{item.description}</p>
   </div>
   <div className="row">
        <div className="dock-right">
        <h4>{item.price}$</h4>
        </div>
    </div>

   <form className="form-inline" >
               <div className="row">
               <div className="dock-right">
            <input type="number" className="form-control" min="1" max="9"  defaultValue="1" onChange={this.handleChange} />
            <input type="button" className="btn btn-default" value="Add to cart" onClick={this.onAddToCart}/>
                        </div>
                        </div>
   </form>
</div>
</div>
    )}
});

var Catalog = React.createClass({
  render: function() {
    return (
      <div className="container">
        {
          this.state.items.map(function(e) {
            return (
              <Item key={e.name} item={e}/>
            );
          })
        }
      </div>
    )
  },

  getInitialState:	function()	{
    return	{
        items:	[]
    };
  },


    componentDidMount: function() {

        var headers = new Headers({
              'Accept': 'application/json',
              'Content-Type': 'application/json'
        });

        if(keycloak.token != null){
            headers.set('Authorization', 'Bearer '+keycloak.token);
        }

       fetch(clientApiGateway+'/catalog/item',
       {
               headers: headers,
               method: "GET",
              })
       .then(
            d => {
                console.log(d)
                return d.json();

        })
       .then(d => {
           this.setState({items: d})
       })
       .catch(function(err) {
           console.log(err.stack)
       });
    }
});

var Cart = React.createClass({
    getInitialState:	function()	{
        return	{
            items:	[]
        };
      },
      load: function(){
          console.log(clientApiGateway+'/cart/'+userInfo.sub)
           var headers = new Headers({
                 'Accept': 'application/json',
                 'Content-Type': 'application/json'
           });

           if(keycloak.token != null){
               headers.set('Authorization', 'Bearer '+keycloak.token);
           }
           fetch(clientApiGateway+'/cart/'+userInfo.sub, {method: 'GET', headers: headers})
           .then(d => {return d.json()})
           .then(d => {
                          var total = 0;
                          for(var i =0;i<d.length;i++){
                            total+= d[i].price*d[i].quantity
                          }
                          this.setState({items: d, total: total})
                      })
           .catch(function(err) {
               console.log(err.stack)
           });
      },
        componentDidMount: function() {
            this.load();
        },
    render: function() {
        return (
        <div className="container">
        <div className="col-md-3"/>
        <div className="col-md-6">
	<table id="cart" className="table table-hover table-condensed">
    				<thead>
						<tr>
							<th width="60%" className="text-center">Product</th>
							<th width="15%" className="text-center">Price</th>
							<th width="5%" className="text-center">Quantity</th>
							<th width="5%" className="text-center"/>
							<th width="15%" className="text-center">Subtotal</th>
						</tr>
					</thead>
					<tbody>
                      {
                              this.state.items.map(e => {
                              return (
                                  <CartItem key={e.itemId} item={e} reloadParent={this.load.bind(this)}/>
                                  );
                              })
                      }
					</tbody>
					<tfoot>
						<tr className="visible-xs">
							<td className="text-center"><strong>Total 1.99</strong></td>
						</tr>
						<tr>
							<td><Link to="catalog" className="btn btn-default">Continue shopping</Link></td>
							<td colspan="2" className="hidden-xs"></td>
							<td className="hidden-xs text-center"><strong>Total {this.state.total}</strong></td>
							<td><Link to="catalog" className="btn btn-default">Buy</Link></td>
						</tr>
					</tfoot>
				</table>
				</div>
				<div className="col-md-3"/>
				</div>
        );
    }


});

var CartItem = React.createClass({
  getInitialState:	function()	{
    return	{ item: this.props.item}
  },
  handleChange(event) {
  var item = this.state.item
  item.quantity = event.target.value
    this.setState({item: item});
    post("cart/"+userInfo.sub, {itemId : item.itemId, quantity: item.quantity},{additive: false});
    this.props.reloadParent();
  },
   removeItem() {
   var item = this.state.item
      remove("cart/"+userInfo.sub+"/"+item.itemId);
      this.props.reloadParent();
    },
  render: function() {
    var item = this.state.item
    return (
						<tr>
							<td data-th="Product" className="text-center">
								<h3>{item.name}</h3>
							</td>
							<td data-th="Price" className="text-center">{item.price}$</td>
							<td data-th="Quantity" className="text-center">
							    <input type="number" className="form-control" value={item.quantity} onChange={this.handleChange} />
							</td>
							<td className="text-center">
                                <span className="glyphicon glyphicon-remove" onClick={this.removeItem}/>
                            </td>
							<td data-th="Subtotal" className="text-center">{item.price * item.quantity}$</td>
						</tr>
    );
  }
});

var GuestHeader = React.createClass({
  onClick: function() {
    keycloak.login();
    return false;
  },
   render: function() {
      return(
      <ul className="nav navbar-nav navbar-right">
       <li><a href="#"  onClick={this.onClick}><span className="glyphicon glyphicon-log-in"/> Login</a></li>
       </ul>
      );
    }
  });

var UserHeader = React.createClass({
  getInitialState:	function()	{
    return	{
        username: userInfo.preferred_username
    }
    },
   render: function() {
      return(
      <ul className="nav navbar-nav navbar-right">
      <li><a href=" "><span className="glyphicon glyphicon-user"/>{this.state.username}</a></li>
      <li><Link to = "cart" ><span className="glyphicon glyphicon-shopping-cart"/>Cart</Link></li>
      <li><a href={keycloak.createLogoutUrl({redirectUri: document.location.protocol + "//" + document.location.host})}><span className="glyphicon glyphicon-log-out"/> Logout</a></li>
      </ul>
      );
    }
  });

var Header = React.createClass({

    render: function() {
        var rightHeader;
        if(keycloak && keycloak.authenticated){
            rightHeader = <UserHeader/>
        } else {
            rightHeader = <GuestHeader/>
        }
        return (
          <nav className="navbar navbar-default">
            <div className="navbar-header">
              <Link to = "catalog" ><h1>Swarm Petstore</h1></Link>
            </div>
            <div className="collapse navbar-collapse" id="myNavbar">
                {rightHeader}
            </div>
          </nav>
        );
    }
});

var App = React.createClass({
    render: function() {
        return (
            <div>
              <Header/>
              <RouteHandler/>
            </div>
        )
    }
});

var routes = (
    <Route handler = {App} path = "/" >
    <DefaultRoute name = "catalog" handler = {Catalog} />
    <Route name = "cart" handler = {Cart}/>
    </Route >
);

var userInfo;

    keycloak.init({ onLoad: 'check-sso' }).success( function() {
      if(keycloak.authenticated){
              console.log("Keycloak authenticated");
              keycloak.loadUserInfo().success( function(profile) {
              userInfo = profile;
               Router.run(routes, Router.HistoryLocation, function(Handler) {
                React.render( < Handler / > , document.getElementById('container'));
              });
            });
      } else {
              Router.run(routes, Router.HistoryLocation, function(Handler) {
                  React.render( < Handler / > , document.getElementById('container'));
               });
        }
    });

