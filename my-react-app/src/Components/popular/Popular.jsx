// Popular.jsx
import Item from '../Item/Item.jsx';
import bestProduct from '../../Assets/data.js';  // Corrected path
import './Popular.css'

const Best = () => {
  return (
    <div className="new">
      <h1>Best Orimo Earpods </h1>
      <hr />
      <div className="new-item">
        {bestProduct.map((item, i) => {
          return <Item 
            key={i} 
            id={item.id} 
            name={item.name} 
            image={item.image} 
            old_price={item.old_price}
            new_price={item.new_price}
          />;
        })}
      </div>
    
    </div>
    
  );
};

export default Best;