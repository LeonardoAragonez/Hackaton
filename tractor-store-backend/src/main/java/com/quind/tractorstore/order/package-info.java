@org.springframework.modulith.ApplicationModule(
        displayName = "Order",
        allowedDependencies = {"cart", "inventory", "catalog", "shared"}
)
package com.quind.tractorstore.order;
