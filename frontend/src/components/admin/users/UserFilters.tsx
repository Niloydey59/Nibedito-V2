"use client";

import { FiSearch, FiFilter, FiRotateCcw, FiChevronDown } from "react-icons/fi";

export default function UserFilters({ filters, setFilters }) {
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, filter: e.target.value }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sortBy: e.target.value }));
  };

  const handleOrderChange = (e) => {
    setFilters((prev) => ({ ...prev, order: e.target.value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      filter: "all",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={filters.search}
          onChange={handleSearch}
          className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <FiFilter className="inline w-4 h-4 mr-1" />
            Status Filter
          </label>
          <div className="relative">
            <select
              value={filters.filter}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="banned">Banned Users</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort By */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sort By
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="block w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="createdAt">Join Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Order */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Order
          </label>
          <div className="relative">
            <select
              value={filters.order}
              onChange={handleOrderChange}
              className="block w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 transition-all duration-200 group"
          >
            <FiRotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search ||
        filters.filter !== "all" ||
        filters.sortBy !== "createdAt" ||
        filters.order !== "desc") && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Active filters:
          </span>

          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              Search: {filters.search}
            </span>
          )}

          {filters.filter !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Status: {filters.filter}
            </span>
          )}

          {filters.sortBy !== "createdAt" && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              Sort: {filters.sortBy}
            </span>
          )}

          {filters.order !== "desc" && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              Order: {filters.order}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
