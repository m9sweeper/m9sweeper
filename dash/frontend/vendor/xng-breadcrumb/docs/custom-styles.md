# Custom styles

- `<xng-breadcrumb>` defines the least possible specificity for selectors, to make it easy to override them.
- override styles by changing the CSS for corresponding classes. (Keep this styles in app root styles file if you don't want to use ::ng-deep)
- Below is a visualization of various classes involved in xng-breadcrumb to help you for easy identification.
- (Optional) xng-breadcrumb takes 'class' as input. This class will be applied to the root of the breadcrumb. This can be used to increase specificity when there are conflicting styles.

  ![image](https://user-images.githubusercontent.com/20707504/68110000-f61af700-ff11-11e9-8834-bc754a46b39d.png)

```css
.xng-breadcrumb-root {
  padding: 8px 16px;
  display: inline-block;
  border-radius: 4px;
  background-color: #e7f1f1;
}

.xng-breadcrumb-separator {
  padding: 0 4px;
}
```
