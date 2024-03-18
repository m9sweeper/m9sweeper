# Disable breadcrumb navigation

You can show an intermediate breadcrumb, but disable navigation if the route has no meaning. The breadcrumb item in the list becomes non clickable.

Two ways to do this -

1. make **disable: true** in route config `breadcrumb: { disable: true }`
2. dynamically skip using `set(<myPathOrAlias>, { disable:true })`;
