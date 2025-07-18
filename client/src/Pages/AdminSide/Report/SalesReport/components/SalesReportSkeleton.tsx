import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SalesReportSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(8)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(8)].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        {colIndex === 0 ? (
                          <Skeleton className="h-4 w-4" />
                        ) : colIndex === 1 ? (
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ) : colIndex === 2 ? (
                          <Skeleton className="h-4 w-32 font-mono" />
                        ) : colIndex === 3 ? (
                          <Skeleton className="h-4 w-20" />
                        ) : colIndex === 4 ? (
                          <Skeleton className="h-6 w-16 rounded-full" />
                        ) : colIndex === 5 ? (
                          <Skeleton className="h-4 w-16" />
                        ) : colIndex === 6 ? (
                          <Skeleton className="h-4 w-20" />
                        ) : (
                          <div className="flex justify-center">
                            <Skeleton className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2 w-full sm:w-auto">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const LoadingTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-8 bg-muted animate-pulse rounded mx-auto"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default SalesReportSkeleton;
export { LoadingTableSkeleton };
