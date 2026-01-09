'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useHistory } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, FileJson, FileSpreadsheet, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ExportPage() {
  const { user } = useAuth();
  const { items, loading, getHistory, deleteItem } = useHistory();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      getHistory(user.email);
    }
  }, [user, getHistory]);

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const exportToJSON = () => {
    const selectedData = items.filter((item) => selectedItems.includes(item.id));
    if (selectedData.length === 0) {
      toast.error('Please select at least one item to export');
      return;
    }

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic-ai-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedData.length} detection(s) to JSON`);
  };

  const exportToCSV = () => {
    const selectedData = items.filter((item) => selectedItems.includes(item.id));
    if (selectedData.length === 0) {
      toast.error('Please select at least one item to export');
      return;
    }

    const headers = ['ID', 'Object Name', 'Advice', 'Date', 'Image Path', 'Heatmap Path'];
    const rows = selectedData.map((item) => [
      item.id,
      item.object_name,
      item.advice.replace(/"/g, '""'),
      item.created_at,
      item.image_path,
      item.heatmap_path,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic-ai-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedData.length} detection(s) to CSV`);
  };

  const bulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedItems.length} detection(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete('/history/bulk', {
        params: { email: user.email },
        data: selectedItems,
      });
      toast.success(`Successfully deleted ${selectedItems.length} detection(s)`);
      setSelectedItems([]);
      getHistory(user.email);
    } catch (error) {
      let errorMsg = 'Failed to delete detections';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        errorMsg = typeof detail === 'string' ? detail : detail.map((e) => e.msg).join(', ');
      }
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Export & Manage Data</h1>
          <p className="text-muted-foreground mt-1">Export your data or perform bulk operations</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export & Manage Data</h1>
        <p className="text-muted-foreground mt-1">
          Select detections to export or delete in bulk
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={toggleSelectAll}
          disabled={items.length === 0}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Button
          variant="outline"
          onClick={exportToJSON}
          disabled={selectedItems.length === 0}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export to JSON ({selectedItems.length})
        </Button>
        <Button
          variant="outline"
          onClick={exportToCSV}
          disabled={selectedItems.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV ({selectedItems.length})
        </Button>
        <Button
          variant="destructive"
          onClick={bulkDelete}
          disabled={selectedItems.length === 0 || isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected ({selectedItems.length})
        </Button>
      </div>

      {/* Data List */}
      <Card>
        <CardHeader>
          <CardTitle>Detection Records</CardTitle>
          <CardDescription>
            {items.length} total detection(s) - {selectedItems.length} selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No detections found
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    selectedItems.includes(item.id)
                      ? 'bg-primary/5 border-primary'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="secondary" className="capitalize">
                        {item.object_name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.advice}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
