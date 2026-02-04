'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';
import { User } from '../../../contexts/UserContext';
import apiService from '@/lib/apiService';
import EvaluationTypeModal from '@/components/EvaluationTypeModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EvaluationsPagination from '@/components/paginationComponent';
import ViewEmployeeModal from '@/components/ViewEmployeeModal';
import RnF_B_EvaluationForm from '@/components/evaluation2/indexes/RnF_B';
import RnF_HO_EvaluationForm from '@/components/evaluation2/indexes/RnF_HO';
import Basic_HO_EvaluationForm from '@/components/evaluation2/indexes/Basic_HO';
import Basic_B_EvaluationForm from '@/components/evaluation2/indexes/Basic_B';
import debounce from 'lodash.debounce';

export default function EmployeesTab() {
  //refreshing state
  const [isRefreshing, setIsRefreshing] = useState(false);

  //data employees
  const [employees, setEmployees] = useState<User[] | null>(null);
  const [positions, setPositions] = useState<
    {
      value: string | number;
      label: string;
    }[]
  >([]);

  // filters
  const [positionFilter, setPositionFilter] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  //pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // modals
  const [isEvaluationTypeModalOpen, setIsEvaluationTypeModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [evaluationType, setEvaluationType] = useState<'employee' | 'manager' | null>(null);
  const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false);

  // View Employee Modal states
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<User | null>(null);
  const [selectedEmployeeForEvaluation, setSelectedEmployeeForEvaluation] = useState<User | null>(
    null
  );

  const fetchEmployees = useMemo(
    () =>
      debounce(async (employeeSearch: string, currentPage: number, positionFilter: string) => {
        setIsRefreshing(true);
        try {
          const res = await apiService.getAllEmployeeByAuth(
            employeeSearch,
            itemsPerPage,
            currentPage,
            Number(positionFilter)
          );
          setEmployees(res.employees.data);
          setOverviewTotal(res.employees.total);
          setTotalPages(res.employees.last_page);
          setPositions(res.positions);
          setIsRefreshing(false);
        } catch (error) {
          console.error('Error fetching employees:', error);
          setEmployees([]);
          setOverviewTotal(0);
          setTotalPages(0);
          setIsRefreshing(false);
        }
      }, 1000),
    []
  );

  useEffect(() => {
    fetchEmployees(employeeSearch, currentPage, positionFilter);
    return () => {
      fetchEmployees.cancel();
    };
  }, [employeeSearch, currentPage, positionFilter]);

  const handleRefresh = () => {
    fetchEmployees(employeeSearch, currentPage, positionFilter);
  };

  const newHiresThisMonth = (() => {
    const now = new Date();
    // Hire date removed - return 0 for new hires this month
    return 0;
  })();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle>Employee Directory</CardTitle>
                <CardDescription>Search and manage employees</CardDescription>
              </div>
              {/* Badge-style employee counts */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-semibold bg-blue-50 text-blue-700 border-blue-200"
                >
                  Total: {overviewTotal || 0}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-semibold bg-green-50 text-green-700 border-green-200"
                >
                  New Hires: {newHiresThisMonth}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl transition-all duration-300"
              title="Refresh employee data"
            >
              {isRefreshing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Refreshing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Refresh</span>
                </div>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 w-1/3 ">
            <div className="relative flex-1">
              <Input
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                }}
                className=" pr-10"
              />
              {employeeSearch && (
                <Button
                  onClick={() => {
                    setEmployeeSearch('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div>
              <Combobox
                options={positions}
                value={positionFilter}
                onValueChangeAction={(value) => {
                  setPositionFilter(String(value));
                }}
                placeholder="All Positions"
                searchPlaceholder="Search positions..."
                emptyText="No positions found."
                className=" cursor-pointer "
              />
            </div>
            {(employeeSearch || positionFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setEmployeeSearch('');
                  setPositionFilter('');
                }}
                className="px-4 py-2 text-sm text-red-400"
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Status Indicators:</span>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                >
                  ✨ New Added (≤30min)
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                >
                  🕐 Recently Added (&gt;30min)
                </Badge>
              </div>
            </div>
          </div>

          {isRefreshing ? (
            <div className="relative max-h-[500px] overflow-y-auto">
              {/* Centered Loading Spinner with Logo */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="flex flex-col items-center gap-3 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
                  <div className="relative">
                    {/* Spinning ring */}
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                    {/* Logo in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="/smct.png" alt="SMCT Logo" className="h-10 w-10 object-contain" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Loading employees...</p>
                </div>
              </div>

              {/* Table structure visible in background */}
              <div className="relative overflow-y-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Skeleton loading rows */}
                    {Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={`skeleton-employee-${index}`}>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : isRefreshing ? (
            <div className="relative overflow-y-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Skeleton loading rows - no spinner for page changes */}
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-employee-page-${index}`}>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="px-6 py-3">
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              <div className="relative overflow-y-auto rounded-lg border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!employees ||
                    employees === null ||
                    !Array.isArray(employees) ||
                    employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <img
                              src="/not-found.gif"
                              alt="No data"
                              className="w-25 h-25 object-contain"
                              style={{
                                imageRendering: 'auto',
                                willChange: 'auto',
                                transform: 'translateZ(0)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                              }}
                            />
                            <div className="text-gray-500">
                              <p className="text-base font-medium mb-1">No employees found</p>
                              <p className="text-sm text-gray-400">
                                Try adjusting your search or filter criteria
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee: any) => {
                        // Check if user is new (within 30 minutes) or recently added (after 30 minutes, within 48 hours)
                        const createdDate = employee.created_at
                          ? new Date(employee.created_at)
                          : null;
                        let isNew = false;
                        let isRecentlyAdded = false;

                        if (createdDate) {
                          const now = new Date();
                          const minutesDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60);
                          const hoursDiff = minutesDiff / 60;
                          isNew = minutesDiff <= 30;
                          isRecentlyAdded = minutesDiff > 30 && hoursDiff <= 48;
                        }

                        return (
                          <TableRow
                            key={employee.id}
                            className={
                              isNew
                                ? 'bg-green-50 border-l-4 border-l-green-500 hover:bg-green-100 hover:shadow-md transition-all duration-200 '
                                : isRecentlyAdded
                                  ? 'bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100 hover:shadow-md transition-all duration-200 '
                                  : 'hover:bg-blue-100 hover:shadow-md transition-all duration-200'
                            }
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span>{employee.fname + ' ' + employee.lname}</span>
                                {isNew && (
                                  <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 font-semibold">
                                    ✨
                                  </Badge>
                                )}
                                {isRecentlyAdded && !isNew && (
                                  <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 font-semibold">
                                    🕐
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{employee.email || 'N/A'}</TableCell>
                            <TableCell>
                              {employee.positions?.label || employee.position || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {employee.branches &&
                              Array.isArray(employee.branches) &&
                              employee.branches.length > 0
                                ? employee.branches[0]?.branch_name || 'N/A'
                                : employee.branch || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {employee.roles &&
                                Array.isArray(employee.roles) &&
                                employee.roles.length > 0
                                  ? employee.roles[0]?.name || 'N/A'
                                  : employee.role || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={() => {
                                    setSelectedEmployeeForView(employee);
                                    setIsViewEmployeeModalOpen(true);
                                  }}
                                  title="View employee details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 cursor-pointer hover:scale-110 shadow-lg hover:shadow-xl transition-all duration-300"
                                  onClick={() => {
                                    setIsEvaluationTypeModalOpen(true);
                                    setSelectedEmployeeForEvaluation(employee);
                                  }}
                                  title="Evaluate employee performance"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {overviewTotal > itemsPerPage && (
            <EvaluationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={overviewTotal}
              perPage={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          )}

          {/* View Employee Modal Component */}
          <ViewEmployeeModal
            isOpen={isViewEmployeeModalOpen}
            onCloseAction={() => {
              setIsViewEmployeeModalOpen(false);
              setSelectedEmployeeForView(null);
            }}
            employee={selectedEmployeeForView}
            designVariant="admin"
            onStartEvaluationAction={() => {}}
            onViewSubmissionAction={() => {}}
          />
        </CardContent>
      </Card>
      <EvaluationTypeModal
        isOpen={isEvaluationTypeModalOpen}
        onCloseAction={() => {
          setIsEvaluationTypeModalOpen(false);
        }}
        onSelectEmployeeAction={() => {
          const employee = selectedEmployeeForEvaluation;
          if (!employee) {
            console.error('No employee selected!');
            return;
          }
          setEvaluationType('employee');
          setIsEvaluationTypeModalOpen(false);

          setIsEvaluationModalOpen(true);
        }}
        onSelectManagerAction={() => {
          const employee = selectedEmployeeForEvaluation;
          if (!employee) {
            console.error('No employee selected!');
            return;
          }
          setEvaluationType('manager');
          setIsEvaluationTypeModalOpen(false);

          setIsEvaluationModalOpen(true);
        }}
        employee={selectedEmployeeForEvaluation}
      />

      <Dialog
        open={isEvaluationModalOpen}
        onOpenChangeAction={(open) => {
          if (!open) {
            setIsEvaluationModalOpen(false);
            setEvaluationType(null);
          }
        }}
      >
        <DialogContent className="max-w-7xl max-h-[101vh] overflow-hidden p-0 evaluation-container">
          {selectedEmployeeForEvaluation && evaluationType === 'employee' && (
            <>
              {selectedEmployeeForEvaluation.branches[0]?.id === 126 ||
              selectedEmployeeForEvaluation.branches[0]?.name === 'HEAD OFFICE' ? (
                <RnF_HO_EvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setEvaluationType(null);
                  }}
                />
              ) : (
                <RnF_B_EvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setEvaluationType(null);
                  }}
                />
              )}
            </>
          )}
          {selectedEmployeeForEvaluation && evaluationType === 'manager' && (
            <>
              {selectedEmployeeForEvaluation.branches[0]?.id === 126 ||
              selectedEmployeeForEvaluation.branches[0]?.name === 'HEAD OFFICE' ? (
                <Basic_HO_EvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setEvaluationType(null);
                  }}
                />
              ) : (
                <Basic_B_EvaluationForm
                  employee={selectedEmployeeForEvaluation}
                  onCloseAction={() => {
                    setIsEvaluationModalOpen(false);
                    setEvaluationType(null);
                  }}
                />
              )}
            </>
          )}
          {/* {selectedEmployee && !evaluationType && (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                Please select an evaluation type... (Debug: employee=
                {selectedEmployee?.name}, type={evaluationType})
              </p>
            </div>
          )} */}
          {/* {!selectedEmployee && (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No employee selected (Debug: evaluationType={evaluationType})
              </p>
            </div>
          )} */}
        </DialogContent>
      </Dialog>
    </>
  );
}
