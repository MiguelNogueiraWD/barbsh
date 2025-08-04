{orders.map(order => (
  <li key={order.id}>
    {order.items.map(item => (
      <div key={item.id}>
        <strong>{item.product.title}</strong> x {item.quantity}
      </div>
    ))}
    Total : {order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} €
    <br />Date : {new Date(order.createdAt).toLocaleString()}
  </li>
))}
