'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Store, Clock, TrendingDown } from 'lucide-react';
import { 
  getUserPricingAnalysis,
  formatPercentage,
  UserPricing 
} from '@/lib/shop-tracker';
import { getUserIdFromCookie, setUserIdCookie } from '@/lib/cookies';
import { ShellDisplay } from './ShellDisplay';
import { HourlyCalculator } from './HourlyCalculator';

type SortField = 'name' | 'currentPrice' | 'basePrice' | 'difference' | 'rating';
type SortDirection = 'asc' | 'desc';

export default function ShopTracker() {
  const [userId, setUserId] = useState(() => getUserIdFromCookie() || '');
  const [isEditingId, setIsEditingId] = useState(() => !getUserIdFromCookie());
  const [tempUserId, setTempUserId] = useState(userId);
  const [userPricing, setUserPricing] = useState<UserPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('currentPrice'); // Default sort by price
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hourlyRate, setHourlyRate] = useState(5); // User's hourly rate for calculations

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortItems = useCallback((items: UserPricing['items']) => {
    return [...items].sort((a, b) => {
      // Always put fixed items at the bottom
      if (a.pricingType === 'fixed' && b.pricingType !== 'fixed') return 1;
      if (a.pricingType !== 'fixed' && b.pricingType === 'fixed') return -1;
      
      let compareValue = 0;
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'currentPrice':
          compareValue = a.currentUserPrice - b.currentUserPrice;
          // For equal prices, prioritize items with better ratings
          if (compareValue === 0 && a.analysis && b.analysis) {
            compareValue = a.analysis.recommendation.score - b.analysis.recommendation.score;
          }
          break;
        case 'basePrice':
          compareValue = a.basePrice - b.basePrice;
          break;
        case 'difference':
          const diffA = ((a.currentUserPrice - a.basePrice) / a.basePrice) * 100;
          const diffB = ((b.currentUserPrice - b.basePrice) / b.basePrice) * 100;
          compareValue = diffA - diffB;
          break;
        case 'rating':
          compareValue = (a.analysis?.recommendation.score || 0) - (b.analysis?.recommendation.score || 0);
          // For equal ratings, prioritize cheaper items
          if (compareValue === 0) {
            compareValue = a.currentUserPrice - b.currentUserPrice;
          }
          break;
      }
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [sortField, sortDirection]);

  const updateAnalysis = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    try {
      const userAnalysis = getUserPricingAnalysis(userId);
      setUserPricing(userAnalysis);
      setUserIdCookie(userId);
    } catch (error) {
      console.error('Error updating analysis:', error);
    }
    setLoading(false);
  }, [userId]);

  const handleUpdateUserId = useCallback(() => {
    if (!tempUserId) return;
    setUserId(tempUserId);
    setIsEditingId(false);
    // Update analysis will be triggered by the useEffect
  }, [tempUserId]);

  const handleEditUserId = useCallback(() => {
    setTempUserId(userId);
    setIsEditingId(true);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      updateAnalysis();
    }
  }, [userId, updateAnalysis]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-6 pt-24 space-y-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Store className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Shipwrecked Shop Tracker
          </h1>
        </div>
        <p className="text-base text-gray-600 mb-8">
          Find the best deals and avoid getting ripped off on the island! 
        </p>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          {!isEditingId && userId ? (
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="font-medium text-gray-600">User ID:</span>{' '}
                <span className="text-gray-900">{userId}</span>
              </div>
              <button
                onClick={handleEditUserId}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Change User ID"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={updateAnalysis}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {loading ? 'Analyzing...' : 'Update Prices'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <label htmlFor="userId" className="pl-4 font-medium text-gray-600">ID:</label>
                <input
                  id="userId"
                  type="text"
                  value={tempUserId}
                  onChange={(e) => setTempUserId(e.target.value)}
                  className="px-3 py-2 bg-transparent border-none outline-none focus:ring-0 text-gray-800"
                  placeholder="Enter your user ID"
                />
              </div>
              <button
                onClick={handleUpdateUserId}
                disabled={!tempUserId}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-sm transition-all"
              >
                Start Tracking
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm">Analyzing prices across all dimensions...</p>
          </div>
        )}
        
        {!loading && !userPricing && (
          <div className="mt-12 max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
            <TrendingDown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-600">
              Enter your user ID and click Update Analysis to see personalized price predictions and recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Hourly Calculator */}
      <HourlyCalculator onRateChange={setHourlyRate} />

      {/* All Items Table */}
      {userPricing && (
        <div className="bg-[#fafafa] border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-6 h-6" />
              All Items Analysis
            </h2>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">Fixed items appear at bottom</span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    onClick={() => toggleSort('name')}
                    className="text-left p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors border-b select-none"
                  >
                    <div className="flex items-center gap-2">
                      Item
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('currentPrice')}
                    className="text-left p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors border-b select-none"
                  >
                    <div className="flex items-center gap-2">
                      Your Price
                      {sortField === 'currentPrice' ? (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('basePrice')}
                    className="text-left p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors border-b select-none"
                  >
                    <div className="flex items-center gap-2">
                      Request Price
                      {sortField === 'basePrice' ? (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('difference')}
                    className="text-left p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors border-b select-none"
                  >
                    <div className="flex items-center gap-2">
                      Difference
                      {sortField === 'difference' ? (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort('rating')}
                    className="text-left p-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors border-b select-none"
                  >
                    <div className="flex items-center gap-2">
                      Rating
                      {sortField === 'rating' ? (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      ) : (
                        <ArrowUpDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-600 border-b">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Best Price Today
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortItems(userPricing.items).map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-4">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{item.pricingType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        <ShellDisplay amount={item.currentUserPrice} />
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="text-gray-600">
                        <ShellDisplay amount={item.basePrice} />
                      </div>
                    </td>
                    <td className="px-4">
                      {item.pricingType === 'randomized' ? (
                        <div className={`font-medium ${
                          item.currentUserPrice < item.basePrice 
                            ? 'text-emerald-600' 
                            : 'text-amber-600'
                        }`}>
                          {formatPercentage(((item.currentUserPrice - item.basePrice) / item.basePrice) * 100)}
                        </div>
                      ) : (
                        <span className="text-gray-400">Static</span>
                      )}
                    </td>
                    <td className="px-4">
                      {item.analysis ? (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              item.analysis.recommendation.score <= 2
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                : item.analysis.recommendation.score <= 3
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                                : item.analysis.recommendation.score <= 4
                                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                                : 'bg-gradient-to-br from-red-500 to-rose-500'
                            }`}>
                              {item.analysis.recommendation.score}
                            </div>
                          </div>
                          <span className="font-medium whitespace-nowrap" style={{ color: item.analysis.recommendation.color }}>
                            {item.analysis.recommendation.action}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4">
                      {item.pricingType === 'randomized' ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            <ShellDisplay amount={item.bestTimeInNext24h.bestPrice} />
                          </div>
                          <div className="text-sm text-blue-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.bestTimeInNext24h.timeFromNow === 'now' 
                              ? 'Available now!' 
                              : `In ${item.bestTimeInNext24h.timeFromNow}`
                            }
                          </div>
                          {item.bestTimeInNext24h.savingsFromCurrent > 0 && (
                            <div className="text-xs text-green-600">
                              Save <ShellDisplay amount={item.bestTimeInNext24h.savingsFromCurrent} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Fixed price
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Algorithm Information */}
      <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <TrendingDown className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Understanding Price Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing System</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Hourly Updates</div>
                    <div className="text-sm text-gray-600">Prices refresh every hour based on your unique user ID</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Price Range</div>
                    <div className="text-sm text-gray-600">Items fluctuate between 90% and 110% of their base price</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-purple-100 rounded-lg">
                    <Store className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Predictable</div>
                    <div className="text-sm text-gray-600">Future prices can be calculated for your user ID</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Price Ratings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm">
                      1-2
                    </div>
                    <span className="font-medium text-emerald-900">Buy Now</span>
                  </div>
                  <p className="text-sm text-emerald-800">Excellent deal - prices won&apos;t get much better than this</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <span className="font-medium text-blue-900">Fair Price</span>
                  </div>
                  <p className="text-sm text-blue-800">Close to base price - reasonable time to buy</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <span className="font-medium text-amber-900">Wait</span>
                  </div>
                  <p className="text-sm text-amber-800">Slightly above base - better prices coming soon</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white flex items-center justify-center font-bold text-sm">
                      5+
                    </div>
                    <span className="font-medium text-red-900">Don&apos;t Buy</span>
                  </div>
                  <p className="text-sm text-red-800">Significantly overpriced - patience will save shells</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
