import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Category = ({ id, label, icon, color, count }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/products/${id}`)}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[rgba(232,101,10,0.1)] shadow-sm hover:shadow-lg transition-all group min-w-[110px]"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-800 text-center leading-tight">{label}</p>
      {count !== undefined && (
        <span className="text-[10px] text-gray-400">{count} items</span>
      )}
    </motion.div>
  );
};

export default Category;