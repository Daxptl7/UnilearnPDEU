import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { fetchCart, removeFromCart, enrollInCourse } from '../api/student.api';
import './Cart.css';

const Cart = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCart = async () => {
        try {
            const response = await fetchCart();
            if (response.success) {
                setItems(response.data);
            }
        } catch (err) {
            console.error('Failed to load cart', err);
            setError('Could not load cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleRemove = async (courseId) => {
        try {
            await removeFromCart(courseId);
            setItems(items.filter(item => item._id !== courseId));
        } catch (err) {
            console.error('Failed to remove item', err);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await enrollInCourse(courseId);
            // Remove from cart local state after enrollment implies it moved to enrolled courses
            setItems(items.filter(item => item._id !== courseId));
            alert('Successfully enrolled!');
        } catch (err) {
            console.error('Failed to enroll', err);
            alert('Failed to enroll. Please try again.');
        }
    };

    if (loading) return <div className="cart-container">Loading cart...</div>;

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            {items.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="btn-browse">Browse Courses</Link>
                </div>
            ) : (
                <div className="cart-items">
                    {items.map(item => (
                        <div key={item._id} className="cart-item">
                            <img src={item.thumbnail} alt={item.name} className="cart-item-img" />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>{item.instructor?.name}</p>
                                <span className="cart-price">{item.price === 0 ? 'Free' : `₹${item.price}`}</span>
                            </div>
                            <div className="cart-item-actions">
                                <button onClick={() => handleEnroll(item._id)} className="btn-enroll">Enroll Now</button>
                                <button onClick={() => handleRemove(item._id)} className="btn-remove">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Cart;
