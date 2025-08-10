'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';

interface Response {
  id: string;
  participant_id: string;
  section: string;
  matrix: number[][];
  weights: number[];
  cr: number;
  created_at: string;
  participants: {
    name: string;
    org?: string;
  };
}

export default function AdminPage() {
  const t = useTranslations();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          *,
          participants (
            name,
            org
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error fetching responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = responses.map(response => ({
      participant: response.participants.name,
      organization: response.participants.org || '',
      section: response.section,
      cr: response.cr,
      date: new Date(response.created_at).toLocaleDateString('fa-IR'),
      weights: response.weights.map(w => w.toFixed(3)).join('; ')
    }));

    const headers = ['نام', 'سازمان', 'بخش', 'CR', 'تاریخ', 'وزن‌ها'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ahp-responses.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-utBlue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {t('admin.title')}
              </h1>
              <div className="space-x-4">
                <button
                  onClick={exportToCSV}
                  className="btn-secondary"
                >
                  خروجی CSV
                </button>
                <button
                  onClick={fetchResponses}
                  className="btn-primary"
                >
                  به‌روزرسانی
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">کل پاسخ‌ها</h3>
                <p className="text-2xl font-bold text-utBlue">{responses.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">پاسخ‌های سازگار</h3>
                <p className="text-2xl font-bold text-green-600">
                  {responses.filter(r => r.cr <= 0.1).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">میانگین CR</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {responses.length > 0 
                    ? (responses.reduce((sum, r) => sum + r.cr, 0) / responses.length).toFixed(3)
                    : '0'
                  }
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">شرکت‌کنندگان منحصر به فرد</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(responses.map(r => r.participant_id)).size}
                </p>
              </div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.participant')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    سازمان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.section')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.cr')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {response.participants.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.participants.org || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        response.cr <= 0.1 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {response.cr.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="text-utBlue hover:text-blue-800"
                      >
                        {t('admin.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {responses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              هنوز پاسخی ثبت نشده است
            </div>
          )}
        </div>

        {/* Response Details Modal */}
        {selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    جزئیات پاسخ - {selectedResponse.participants.name}
                  </h2>
                  <button
                    onClick={() => setSelectedResponse(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">اطلاعات کلی</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>نام:</strong> {selectedResponse.participants.name}</div>
                      <div><strong>سازمان:</strong> {selectedResponse.participants.org || '-'}</div>
                      <div><strong>بخش:</strong> {selectedResponse.section}</div>
                      <div><strong>نرخ ناسازگاری:</strong> {selectedResponse.cr.toFixed(3)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">وزن‌های محاسبه شده</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {selectedResponse.weights.map((weight, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span>معیار {index + 1}:</span>
                          <span className="font-mono">{weight.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">ماتریس مقایسه</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <tbody>
                          {selectedResponse.matrix.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j} className="border border-gray-300 p-2 text-center">
                                  {cell === 1 ? '1' : 
                                   cell < 1 ? `1/${Math.round(1/cell)}` : 
                                   Math.round(cell).toString()}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}