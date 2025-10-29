"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, Car, MapPin, DollarSign, Calendar } from "lucide-react";
import { mockProperties } from "@/components/mock-data";
import { AddPropertyDialog } from "./_components/add-property-dialog";

export function PropertyManagementView() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const totalValue = mockProperties.reduce((sum, prop) => sum + prop.estimatedValue, 0);

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "Building":
        return Building2;
      case "Vehicle":
        return Car;
      case "Land":
        return MapPin;
      default:
        return Building2;
    }
  };

  const groupedByType = mockProperties.reduce((acc, property) => {
    if (!acc[property.type]) {
      acc[property.type] = [];
    }
    acc[property.type].push(property);
    return acc;
  }, {} as Record<string, typeof mockProperties>);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{mockProperties.length}</div>
            <p className="text-slate-600">Assets owned</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalValue.toLocaleString()}</div>
            <p className="text-slate-600">Estimated worth</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Status</CardTitle>
            <Badge className="rounded-lg bg-green-500">All Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{mockProperties.filter(p => p.status === "Owned").length}</div>
            <p className="text-slate-600">Properties owned</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Church Properties</CardTitle>
              <CardDescription>Manage and monitor church-owned assets</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedByType).map(([type, properties]) => {
            const Icon = getPropertyIcon(type);
            return (
              <div key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900">{type}</h3>
                    <p className="text-slate-600">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
                  </div>
                </div>

                <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-slate-900">{property.name}</p>
                              {property.notes && (
                                <p className="text-slate-500">{property.notes}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{property.address}</TableCell>
                          <TableCell className="text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(property.purchaseDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-900">
                            ${property.estimatedValue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="rounded-lg bg-green-500">
                              {property.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
