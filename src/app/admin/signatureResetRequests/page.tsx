'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton, SkeletonButton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RefreshCw, Check, X } from 'lucide-react';
import apiService from '@/lib/apiService';
import { useToast } from '@/hooks/useToast';
import EvaluationsPagination from '@/components/paginationComponent';
import debounce from 'lodash.debounce';

interface SignatureResetRequest {
  id: number;
  position_id: number;
  department_id: number;
  date_hired: string;
  username: string;
  fname: string;
  lname: string;
  email: string;
  contact: string;
  emp_id: string;
  signature: string;
  requestSignatureReset: boolean;
  approvedSignatureReset: boolean;
  created_at: string;
  updated_at: string;
  full_name: string;
  branches: any;
  departments: any;
  positions: any;
}

export default function SignatureResetRequestsTab() {
  const [data, setData] = useState<SignatureResetRequest[]>([]);

  const [refresh, setRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureResetRequest | null>(null);

  const { success, error: showError } = useToast();

  const loadRequests = useMemo(
    () =>
      debounce(async (searchValue: string) => {
        setRefresh(true);
        try {
          const response = await apiService.getSignatureResetRequests(searchValue);
          setData(response);
          setRefresh(false);
        } catch (err) {
          setRefresh(false);
          setData([]);
          console.error('Error loading signature reset requests:', err);
          showError('Failed to load signature reset requests');
        }
      }, 1000),
    []
  );
  useEffect(() => {
    loadRequests(searchTerm);
    return () => {
      loadRequests.cancel();
    };
  }, [searchTerm]);

  const handleRefresh = async () => {
    await loadRequests(searchTerm);
  };

  const handleApprove = async () => {
    if (!selectedRequest || selectedRequest === null) return;
    try {
      await apiService.approveSignatureReset(selectedRequest.id);
      success('Signature reset request approved successfully!');
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      handleRefresh();
    } catch (err: any) {
      console.error('Error approving request:', err);
      showError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || selectedRequest === null) return;

    try {
      await apiService.rejectSignatureReset(selectedRequest.id);
      success('Signature reset request rejected successfully!');
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      handleRefresh();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      showError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const openApproveModal = (request: SignatureResetRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (request: SignatureResetRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  return (
    <div className="relative overflow-y-auto pr-2 min-h-[400px]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Signature Reset Requests</CardTitle>
              <CardDescription>Manage signature reset requests from users</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refresh}
              className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 text-white hover:text-white border-blue-600 hover:border-green-700 cursor-pointer hover:scale-110 transition-all duration-300"
            >
              <RefreshCw className={`h-4 w-4 ${refresh ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">User</TableHead>
                  <TableHead className="w-1/6">Email</TableHead>
                  <TableHead className="w-1/6">Position</TableHead>
                  <TableHead className="w-1/6">Department</TableHead>
                  <TableHead className="w-1/6">Branch</TableHead>
                  <TableHead className="w-1/6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refresh ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <SkeletonButton size="sm" className="w-24" />
                          <SkeletonButton size="sm" className="w-24" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <img
                          src="/not-found.gif"
                          alt="No data"
                          className="w-25 h-25 object-contain"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onDrag={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onDragEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                          onMouseDown={(e) => {
                            // Prevent default behavior on mouse down to prevent dragging
                            if (e.button === 0) {
                              // Left mouse button
                              e.preventDefault();
                            }
                          }}
                          style={
                            {
                              imageRendering: 'auto',
                              willChange: 'auto',
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                            } as React.CSSProperties
                          }
                        />
                        <div className="text-gray-500">
                          {searchTerm !== '' ? (
                            <>
                              <p className="text-base font-medium mb-1">
                                No signature reset requests found
                              </p>
                              <p className="text-sm">
                                Try adjusting your search or date filter criteria
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-base font-medium mb-1">
                                No signature reset requests
                              </p>
                              <p className="text-sm">
                                Requests will appear here when users request signature resets
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data &&
                  data.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.fname} {request.lname}
                          </div>
                          <div className="text-sm text-gray-500">@{request.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.positions?.label || request.position || 'N/A'}</TableCell>
                      <TableCell>
                        {request.departments?.department_name || request.department || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {request.branches?.length > 0
                          ? request.branches.map((b: any) => b.branch_name || b.name).join(', ')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveModal(request)}
                            className="text-white bg-green-600 border-green-300 hover:text-white hover:bg-green-600 cursor-pointer hover:scale-110 transition-all duration-300"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(request)}
                            className="text-white bg-red-600 border-red-300 hover:text-white hover:bg-red-600 cursor-pointer hover:scale-110 transition-all duration-300"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject Request
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <EvaluationsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={totalItems}
                perPage={itemsPerPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Modal */}
      <Dialog open={isApproveModalOpen} onOpenChangeAction={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Signature Reset Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the signature reset request for{' '}
              <strong>{selectedRequest?.full_name}</strong>? This will allow them to clear their
              signature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              disabled={isApproving}
              className={`bg-blue-600 hover:bg-green-700 flex items-center gap-2 shadow-lg transition-all duration-300 ${
                isApproving
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer hover:scale-110 hover:shadow-xl'
              }`}
              onClick={async () => {
                setIsApproving(true);
                try {
                  await handleApprove();
                } finally {
                  setIsApproving(false);
                }
              }}
            >
              {isApproving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={isRejectModalOpen} onOpenChangeAction={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Signature Reset Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the signature reset request for{' '}
              <strong>{selectedRequest?.full_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              disabled={isRejecting}
              variant="destructive"
              className={`text-white bg-blue-600 hover:text-white hover:bg-red-500 cursor-pointer flex items-center gap-2 shadow-lg transition-all duration-300 ${
                isRejecting
                  ? 'cursor-not-allowed opacity-80'
                  : 'cursor-pointer hover:scale-110 hover:shadow-xl'
              }`}
              onClick={async () => {
                setIsRejecting(true);

                try {
                  await handleReject();
                } finally {
                  setIsRejecting(false);
                }
              }}
            >
              {isRejecting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
