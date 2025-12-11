import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { db } from '../../services/mockDatabase';
import { Upload, Plus, FileSpreadsheet, Search } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const fetchProducts = () => {
    db.getProducts().then(setProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      // Simple CSV parsing simulation
      // Assumes CSV format: Name, Unit
      const lines = text.split('\n');
      const newItems = lines.map(line => {
        const [name, unit] = line.split(',');
        return { name: name?.trim(), unit: unit?.trim() || 'pcs' };
      }).filter(i => i.name); // Filter empty

      if (newItems.length > 0) {
        await db.importProducts(newItems);
        fetchProducts();
        alert(`Imported ${newItems.length} items successfully.`);
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const handleAddManual = async () => {
    const name = prompt("Product Name:");
    if (!name) return;
    const unit = prompt("Unit:", "pcs");
    if (!unit) return;
    
    await db.createProduct(name, unit);
    fetchProducts();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Product Catalog</h2>
        
        <div className="flex gap-2">
           <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer shadow-sm">
             <FileSpreadsheet size={18} />
             {isImporting ? 'Importing...' : 'Import CSV'}
             <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isImporting}/>
           </label>
           
           <button 
             onClick={handleAddManual}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
           >
             <Plus size={18} /> Add Item
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input 
                type="text" 
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 p-2 border rounded-lg"
            />
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800">
            <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm">
                    <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Unit</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{p.name}</td>
                            <td className="p-3 text-gray-500">{p.unit}</td>
                            <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100'}`}>
                                    {p.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr><td colSpan={3} className="p-4 text-center text-gray-400">No products found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Products;