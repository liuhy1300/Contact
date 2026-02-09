import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CategoryKey, BaseOption } from '../types';
import { Plus, Trash2, Save, RefreshCw, X, Edit2 } from 'lucide-react';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'roles', label: '角色 (Roles)' },
  { key: 'industries', label: '行业 (Industries)' },
  { key: 'products', label: '产品 (Products)' },
  { key: 'audiences', label: '受众 (Audiences)' },
  { key: 'styles', label: '风格 (Styles)' },
  { key: 'tones', label: '语气 (Tones)' },
  { key: 'brands', label: '品牌 (Brands)' },
  { key: 'channels', label: '分发渠道 (Core)' },
  { key: 'distributionChannels', label: '衍生渠道 (Dist)' },
  { key: 'competitors', label: '竞争对手' },
  { key: 'journeyStages', label: '旅程阶段' },
  { key: 'ctaStrategies', label: 'CTA 策略' },
];

const Admin: React.FC = () => {
  const { data, addItem, updateItem, deleteItem, resetData } = useData();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('roles');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempItem, setTempItem] = useState<any | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<any>({ id: '', name: '', desc: '' });

  const currentItems = data[activeCategory] as BaseOption[];

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTempItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingId && tempItem) {
      updateItem(activeCategory, editingId, tempItem);
      setEditingId(null);
      setTempItem(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确认删除此选项吗？')) {
      deleteItem(activeCategory, id);
    }
  };

  const handleAddItem = () => {
    if (!newItem.id || !newItem.name) return alert('ID and Name are required');
    addItem(activeCategory, newItem);
    setIsModalOpen(false);
    setNewItem({ id: '', name: '', desc: '' });
  };

  // Render specific fields based on category
  const renderExtraFields = (item: any, isEditing: boolean) => {
    if (activeCategory === 'industries') {
      return (
        <div className="mt-2">
            <label className="text-[10px] uppercase font-bold text-slate-400">Pain Points</label>
            {isEditing ? (
                <textarea 
                    className="w-full text-xs p-2 border rounded"
                    value={item.painPoints || ''}
                    onChange={e => isEditing && setTempItem({...item, painPoints: e.target.value})}
                />
            ) : (
                <p className="text-xs text-slate-600 truncate">{item.painPoints}</p>
            )}
        </div>
      )
    }
    if (activeCategory === 'products') {
        return (
          <div className="mt-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Features</label>
              {isEditing ? (
                  <input 
                      className="w-full text-xs p-2 border rounded"
                      value={item.features || ''}
                      onChange={e => isEditing && setTempItem({...item, features: e.target.value})}
                  />
              ) : (
                  <p className="text-xs text-slate-600 truncate">{item.features}</p>
              )}
          </div>
        )
      }
    return null;
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* Category Sidebar */}
      <div className="w-48 md:w-64 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">配置选项</h2>
        </div>
        <ul>
          {CATEGORIES.map(cat => (
            <li key={cat.key}>
              <button
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-4 py-3 text-xs font-medium border-l-4 transition-all ${
                  activeCategory === cat.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 mt-8 border-t border-slate-100">
            <button 
                onClick={() => { if(window.confirm('Reset all data to defaults?')) resetData() }}
                className="flex items-center text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
                <RefreshCw className="w-3 h-3 mr-1" /> 重置所有数据
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{CATEGORIES.find(c => c.key === activeCategory)?.label}</h1>
            <p className="text-xs text-slate-500">Manage entries for prompt generation</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> 新增条目
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item) => {
              const isEditing = editingId === item.id;
              const activeItem = isEditing ? tempItem : item;

              return (
                <div key={item.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${isEditing ? 'ring-2 ring-blue-400 border-blue-400' : 'border-slate-200 hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-2">
                    {isEditing ? (
                        <input 
                            className="text-sm font-bold border-b border-blue-300 w-full pb-1 mb-1 outline-none text-slate-800"
                            value={activeItem.name}
                            onChange={(e) => setTempItem({...activeItem, name: e.target.value})}
                        />
                    ) : (
                        <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                    )}
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono ml-2 shrink-0">{item.id}</span>
                  </div>
                  
                  {isEditing ? (
                      <textarea 
                          className="w-full text-xs text-slate-600 border rounded p-2 h-16 mb-2 bg-slate-50"
                          value={activeItem.desc || ''}
                          onChange={(e) => setTempItem({...activeItem, desc: e.target.value})}
                      />
                  ) : (
                      <p className="text-xs text-slate-500 line-clamp-2 h-8">{item.desc}</p>
                  )}

                  {renderExtraFields(activeItem, isEditing)}

                  <div className="flex justify-end mt-4 pt-3 border-t border-slate-100 space-x-2">
                    {isEditing ? (
                        <>
                             <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                            <button onClick={handleSaveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                <Save className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Add New {activeCategory}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ID (Unique key)</label>
                <input 
                    className="w-full border p-2 rounded text-sm" 
                    value={newItem.id} 
                    onChange={e => setNewItem({...newItem, id: e.target.value})}
                    placeholder="e.g., tech_startups"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                <input 
                    className="w-full border p-2 rounded text-sm" 
                    value={newItem.name} 
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Display Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea 
                    className="w-full border p-2 rounded text-sm h-20" 
                    value={newItem.desc} 
                    onChange={e => setNewItem({...newItem, desc: e.target.value})}
                />
              </div>
              
              {/* Conditional Fields for New Items */}
              {activeCategory === 'industries' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pain Points</label>
                    <textarea 
                        className="w-full border p-2 rounded text-sm" 
                        onChange={e => setNewItem({...newItem, painPoints: e.target.value})}
                    />
                  </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddItem} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;