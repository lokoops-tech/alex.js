import './NewCollection.css'; // Import the CSS file for styling
import newCollection from '../../Assets/newcollection'; // Import the new collection data

// Import the Item component from the correct relative path
import Item from '../Item/Item.jsx';

const NewProducts = () => {
  return (
    <div className="new-collection">
      <h1>New Collection</h1> {/* Capitalize "Collection" for consistency */}
      <hr />
      <div className="collection">
        {newCollection.map((item, i) => ( // Use item directly from the data
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            old_price={item.old_price}
            new_price={item.new_price}
          />
        ))};
      </div>
    </div>
  );
};

export default NewProducts;