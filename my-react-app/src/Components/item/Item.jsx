// Item.jsx
import { Link } from 'react-router-dom';
import './Item.css';

const Item = (props) => {
    const handleClick = () => {
        window.scrollTo(0, 0);
    };

    return (
        <div className="all">
            <div className="Item">
                <div className="item-">
                    <Link to={`/product/${props.id}`}>
                        <img 
                            onClick={handleClick} 
                            className="img" 
                            src={props.image} 
                            alt={props.name}
                    
                        />
                    </Link>
                    
                    <div className='name'>
                            {props.name}
                    
                        <div className="item-price">
                            <div className="item-price-old">
                                Ksh {props.old_price}
                                <div className="item-price-new">
                                    Ksh {props.new_price}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Item;