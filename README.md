# Shopgate Connect - Cart Gifts

This extension allows merchants to have cart gifts (free items, etc).

## Configuration

Set the following values in your Shopgate Connect Admin:
* `configEndpoint` - (text) endpoint URL to fetch configuration
* `staticConfig` - (text) static configuration
* `configTTL` - (text) configuration TTL im seconds

The endpoint should provide a JSON file:

```json
[ 
  { 
    "expression": "totals[.type == 'grandTotal'].amount > 75", 
    "productIds": ["4482"]
  }
]
```

* `expression` - (text) expression to evaluate against [cart data](https://developer.shopgate.com/references/connect/shopgate-pipelines/cart/shopgate.cart.getcart.v1) 
* `productIds` - (array of strings) gift items IDs to add to a cart when the matched expression succeeded

Documentation for expressions is available at [`jexl` library](https://github.com/TomFrost/jexl#user-content-collections)  

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.
## License
See the [LICENSE](./LICENSE) file for more information.
