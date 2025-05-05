"use client";

import EmptyList from "@/components/home/EmptyList";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyProperties } from "@/hooks/useProperty";
import { IconButton } from "@/components/host/IconButton";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Loader from "@/components/Loader";
import { Property } from "@/types/property";

function MyPropertiesPage() {
  const { data, loading, error } = useMyProperties();
  const router = useRouter();
  const properties = data?.myProperties || [];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="mt-16 text-red-500 text-center">
        <h3 className="text-xl font-semibold">
          Error loading properties
        </h3>
        <p className="mt-2">{error.message}</p>
      </div>
    );

  if (properties.length === 0) {
    return (
      <EmptyList
        heading="No properties to display."
        message="Don't hesitate to create a property."
      />
    );
  }

  const handleEdit = (propertyId: string) => {
    router.push(`/host/listings/${propertyId}`);
  };

  return (
    <Container>
      <div className="pb-10 pt-12 mx-auto w-full max-w-[1200px]">
        <h1 className="text-2xl font-semibold mb-8 capitalize">
          My Listings{" "}
          <Badge variant="outline" className="ml-2">
            {properties.length}
          </Badge>
        </h1>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">
                  Property Name
                </TableHead>
                <TableHead className="font-semibold">
                  Price
                </TableHead>
                <TableHead className="font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: Property) => {
                const {
                  id: propertyId,
                  name,
                  price,
                } = property;
                return (
                  <TableRow
                    key={propertyId}
                    className="hover:bg-slate-50"
                  >
                    <TableCell>
                      <Link
                        href={`/properties/${propertyId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(price)}
                    </TableCell>
                    <TableCell className="flex items-center gap-x-2">
                      <IconButton
                        actionType="edit"
                        onClick={() =>
                          handleEdit(propertyId)
                        }
                      />
                      <IconButton
                        actionType="delete"
                        propertyId={propertyId}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {properties.map((property: Property) => {
            const {
              id: propertyId,
              name,
              price,
            } = property;
            return (
              <Card
                key={propertyId}
                className="overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/properties/${propertyId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-medium">
                        {formatCurrency(price)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <IconButton
                    actionType="edit"
                    onClick={() => handleEdit(propertyId)}
                  />
                  <IconButton
                    actionType="delete"
                    propertyId={propertyId}
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

export default MyPropertiesPage;
