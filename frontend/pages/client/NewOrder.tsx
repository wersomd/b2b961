import React, { useEffect, useState, useRef } from 'react';
import { OrderItem, Product, StockStatus, User } from '../../types';
import { db } from '../../services/mockDatabase';
import { Plus, Trash2, Calendar, MapPin, Search } from 'lucide-react';

interface Props {
  user: User;
  onSuccess: () => void;
}

const NewOrder: React.FC<Props> = ({ user, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  
  const [items, setItems] = useState<Partial<OrderItem>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  useEffect(() => {
    db.getProducts().then(setProducts);
  }, []);

  const handleAddItem = (product?: Product) => {
    const newItem: Partial<OrderItem> = {
      id: `temp_${Date.now()}`,
      quantity: 1,
      stockStatus: StockStatus.UNKNOWN,
      productId: product?.id || null,
      productName: product?.name || '',
    };
    setItems([...items, newItem]);
    setSearchTerm('');
    setShowSuggestions(false);
    setActiveRowIndex(items.length); // Focus next
  };

  const handleCreateNewProduct = async (name: string) => {
    // Determine unit (mocked dialog)
    const unit = prompt(`Unit for "${name}"? (e.g., pcs, kg, box)`, 'pcs');
    if (unit) {
      const newProduct = await db.createProduct(name, unit);
      setProducts([...products, newProduct]);
      handleAddItem(newProduct);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index].quantity = parseInt(val) || 0;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add at least one item');
    
    await db.createOrder({
      title,
      deliveryDate,
      deliveryAddress: address,
      comment,
      items: items as OrderItem[]
    }, user);
    
    onSuccess();
  };

  // Filter products for autocomplete
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Order</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Concrete for Foundation Phase 1"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={16}/> Expected Delivery
            </label>
            <input 
              required
              type="date" 
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MapPin size={16}/> Address
            </label>
            <input 
              required
              type="text" 
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Site Address"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea 
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Items</h3>
          
          {/* Add Item Bar */}
          <div className="relative mb-6">
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                 <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search product to add..."
                    className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>
             </div>

             {/* Autocomplete Dropdown */}
             {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItem(p)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{p.unit}</span>
                    </button>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                     <button
                        type="button"
                        onClick={() => handleCreateNewProduct(searchTerm)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-medium border-t"
                     >
                       + Create new product "{searchTerm}"
                     </button>
                  )}
                </div>
             )}
          </div>

          {/* List */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                </div>
                <div className="w-32">
                  <input 
                    type="number" 
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Qty"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {items.length === 0 && <p className="text-center text-gray-400 py-4">No items added yet.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onSuccess} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200">
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;