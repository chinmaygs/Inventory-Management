import './App.css';
import { useState, useReducer, useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

type Action =
  | { type: 'ADD'; item: InventoryItem }
  | { type: 'DELETE'; id: string }
  | { type: 'EDIT'; id: string; item: InventoryItem }
  | { type: 'SET'; items: InventoryItem[] };

function reducer(state: InventoryItem[], action: Action): InventoryItem[] {
  switch (action.type) {
    case 'ADD':
      return [{ ...action.item, id: Math.random().toString() }, ...state];
    case 'DELETE':
      return state.filter((item) => item.id !== action.id);
    case 'EDIT':
      return state.map((item) =>
        item.id === action.id ? { ...item, ...action.item } : item
      );
    case 'SET':
      return action.items;
    default:
      return state;
  }
}

function App() {
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [update, setUpdate] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const storedInventory = localStorage.getItem('inventory');
  const initialInventory: InventoryItem[] = storedInventory
    ? JSON.parse(storedInventory)
    : [];

  const [inventory, dispatch] = useReducer(reducer, initialInventory);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const addItem = () => {
    if (name && quantity > 0 && price > 0 && category) {
      const newItem: InventoryItem = { id: '', name, quantity, price, category };
      dispatch({ type: 'ADD', item: newItem });
      setName('');
      setQuantity(0);
      setPrice(0);
      setCategory('');
    } else {
      alert('Please provide valid item details!');
    }
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE', id });
  };

  const updateItem = (id: string, item: InventoryItem) => {
    setId(id);
    setName(item.name);
    setQuantity(item.quantity);
    setPrice(item.price);
    setCategory(item.category);
    setUpdate(true);
  };

  const updateInventoryItem = () => {
    const updatedItem: InventoryItem = { id, name, quantity, price, category };
    dispatch({ type: 'EDIT', id, item: updatedItem });
    setUpdate(false);
    setName('');
    setQuantity(0);
    setPrice(0);
    setCategory('');
  };

  const handleSort = () => {
    const sortedInventory = [...inventory].sort((a, b) => {
      return sortDirection === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    });
    dispatch({ type: 'SET', items: sortedInventory });
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredInventory = inventory.filter(item =>
    filterCategory ? item.category.toLowerCase() === filterCategory.toLowerCase() : true
  );

  return (
    <div className='bg-cyan-100'>
      <div className="max-w-4xl mx-auto p-6 font-sans">
        <h2 className="text-center text-2xl font-bold mb-6">Inventory Management</h2>

        {/* Filter by Category */}
        <div className="mb-4">
          <label className="block text-sm font-semibold">Filter by Category:</label>
          <input
            type="text"
            placeholder="Enter category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="mt-2 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Item Form */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Item name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
          <input
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
          <input
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>

        {/* Add or Update Button */}
        <div className="text-center">
          {update ? (
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-md"
              onClick={updateInventoryItem}
            >
              UPDATE
            </button>
          ) : (
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-md"
              onClick={addItem}
            >
              ADD ITEM
            </button>
          )}
        </div>

        {/* Sort by Quantity */}
        <div className="text-center my-4">
          <button
            className="px-6 py-2 bg-orange-500 text-white rounded-md"
            onClick={handleSort}
          >
            Sort by Quantity ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
          </button>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className={`${item.quantity < 10 ? 'bg-red-100' : 'bg-white'
                    } border-b`}
                >
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">
                    <button
                      className="px-4 py-1 bg-yellow-500 text-white rounded-md mr-2"
                      onClick={() => updateItem(item.id, item)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-1 bg-red-500 text-white rounded-md"
                      onClick={() => deleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
