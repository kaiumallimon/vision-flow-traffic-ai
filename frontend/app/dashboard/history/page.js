'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useHistory } from '@/lib/hooks';
import {
  Trash2,
  Eye,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [detections, setDetections] = useState([]);
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { getHistory, deleteItem, loading } = useHistory();

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchHistory(parsedUser.email);
    }
  }, []);

  useEffect(() => {
    // Filter detections based on search query
    if (!searchQuery) {
      setFilteredDetections(detections);
    } else {
      const filtered = detections.filter((detection) => {
        const name = detection.object_name || detection.objectName || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredDetections(filtered);
    }
  }, [searchQuery, detections]);

  const fetchHistory = async (email) => {
    try {
      setError('');
      const data = await getHistory(email);
      setDetections(data);
    } catch (err) {
      setError('Failed to fetch detection history');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setDeleteLoading(true);
    try {
      await deleteItem(selectedItem.id);
      setDetections(detections.filter((d) => d.id !== selectedItem.id));
      setSuccess('Detection removed successfully');
      setIsDeleteDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete detection');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Detection History
        </h1>
        <p className="text-slate-600 mt-2">
          View and manage all your traffic detection analyses
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by object name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Detections Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Detections {detections.length > 0 && `(${detections.length})`}
          </CardTitle>
          <CardDescription>
            {filteredDetections.length} {filteredDetections.length === 1 ? 'result' : 'results'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filteredDetections.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Object Detected</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetections.map((detection) => (
                    <TableRow key={detection.id}>
                      <TableCell>
                        <Badge variant="default" className="capitalize">
                          {detection.object_name || detection.objectName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(detection.created_at || detection.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">High</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(detection)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(detection)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-slate-600 font-medium">
                  {searchQuery ? 'No detections found' : 'No detections yet'}
                </p>
                {!searchQuery && (
                  <p className="text-slate-500 text-sm mt-1">
                    Upload an image to start analyzing
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detection Details</DialogTitle>
            <DialogDescription>
              View the analysis results and heatmap
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Original Image</p>
                  <img
                    src={selectedItem.image_path || selectedItem.imagePath}
                    alt="Original"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Heatmap</p>
                  <img
                    src={selectedItem.heatmap_path || selectedItem.heatmapPath}
                    alt="Heatmap"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Detected Object
                </p>
                <Badge variant="default" className="capitalize mb-4">
                  {selectedItem.object_name || selectedItem.objectName}
                </Badge>

                <p className="text-sm font-medium text-slate-700 mb-2">Recommendation</p>
                <p className="text-slate-600 text-sm">{selectedItem.advice}</p>
              </div>

              <p className="text-xs text-slate-500">
                Analyzed on{' '}
                {new Date(selectedItem.created_at || selectedItem.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Detection?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The detection record and associated
              images will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
