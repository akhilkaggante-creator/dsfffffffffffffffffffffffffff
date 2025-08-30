import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, CheckCircle, Save, Phone } from "lucide-react";

export default function Verification() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [bookingId, setBookingId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchMethod, setSearchMethod] = useState<"id" | "phone">("id");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    totalAmount: "",
    cashAmount: "",
    upiAmount: "",
    isEighteenPlus: true,
    visited: true,
    reasonNotEighteen: "",
    reasonNotVisited: "",
    customerName: ""
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Search booking by ID or phone number
  const searchBooking = async () => {
    if (!bookingId && !phoneNumber) {
      toast({
        title: "Search Required",
        description: "Please enter a booking ID or phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      let booking = null;
      
      if (searchMethod === "id" && bookingId) {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          booking = await response.json();
        }
      } else if (searchMethod === "phone" && phoneNumber) {
        const response = await fetch(`/api/bookings/search?phone=${phoneNumber}`);
        if (response.ok) {
          const bookings = await response.json();
          if (bookings.length > 0) {
            booking = bookings[0]; // Get the most recent booking
          }
        }
      }

      if (booking) {
        setSelectedBooking(booking);
        setEditForm({
          totalAmount: booking.totalAmount?.toString() || "",
          cashAmount: booking.cashAmount?.toString() || "",
          upiAmount: booking.upiAmount?.toString() || "",
          isEighteenPlus: booking.isEighteenPlus !== false,
          visited: booking.visited !== false,
          reasonNotEighteen: booking.reasonNotEighteen || "",
          reasonNotVisited: booking.reasonNotVisited || "",
          customerName: booking.customerName || ""
        });
      } else {
        toast({
          title: "Booking Not Found",
          description: "No booking found with the provided details",
          variant: "destructive"
        });
        setSelectedBooking(null);
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for booking",
        variant: "destructive"
      });
    }
  };

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return await apiRequest("PATCH", `/api/bookings/${selectedBooking.id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsEditing(false);
      // Refresh the booking data
      searchBooking();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    // Validate amounts
    const totalAmount = parseFloat(editForm.totalAmount);
    const cashAmount = parseFloat(editForm.cashAmount);
    const upiAmount = parseFloat(editForm.upiAmount);

    if (isNaN(totalAmount) || isNaN(cashAmount) || isNaN(upiAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid numeric amounts",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs((cashAmount + upiAmount) - totalAmount) > 0.01) {
      toast({
        title: "Amount Mismatch",
        description: "Cash + UPI must equal total amount",
        variant: "destructive"
      });
      return;
    }

    updateBookingMutation.mutate({
      totalAmount,
      cashAmount,
      upiAmount,
      isEighteenPlus: editForm.isEighteenPlus,
      visited: editForm.visited,
      reasonNotEighteen: editForm.reasonNotEighteen,
      reasonNotVisited: editForm.reasonNotVisited,
      customerName: editForm.customerName
    });
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rosae-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Booking Verification</h2>
            <p className="text-gray-400">Search and edit booking details for verification</p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="bg-rosae-dark-gray border-gray-600 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Method Toggle */}
            <div className="flex space-x-4">
              <Button
                variant={searchMethod === "id" ? "default" : "outline"}
                onClick={() => setSearchMethod("id")}
                className={searchMethod === "id" ? "bg-rosae-red hover:bg-rosae-dark-red" : "border-gray-600 text-gray-300"}
              >
                Search by Booking ID
              </Button>
              <Button
                variant={searchMethod === "phone" ? "default" : "outline"}
                onClick={() => setSearchMethod("phone")}
                className={searchMethod === "phone" ? "bg-rosae-red hover:bg-rosae-dark-red" : "border-gray-600 text-gray-300"}
              >
                Search by Phone Number
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex space-x-4">
              {searchMethod === "id" ? (
                <div className="flex-1">
                  <Label htmlFor="bookingId" className="text-gray-300">Booking ID</Label>
                  <Input
                    id="bookingId"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Enter booking ID"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}
              <Button onClick={searchBooking} className="bg-rosae-red hover:bg-rosae-dark-red self-end">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details Section */}
        {selectedBooking && (
          <Card className="bg-rosae-dark-gray border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Booking Details</CardTitle>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20">
                      Edit Details
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} disabled={updateBookingMutation.isPending} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="border-gray-600 text-gray-300">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300">Booking ID</Label>
                  <p className="text-white font-mono">{selectedBooking.id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Theatre</Label>
                  <p className="text-white">{selectedBooking.theatreName}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <p className="text-white">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Time Slot</Label>
                  <p className="text-white">{selectedBooking.timeSlot}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Guests</Label>
                  <p className="text-white">{selectedBooking.guests}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Phone Number</Label>
                  <p className="text-white">{selectedBooking.phoneNumber}</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-white">Editable Details</h3>
                
                {/* Customer Name */}
                <div>
                  <Label htmlFor="customerName" className="text-gray-300">Customer Name</Label>
                  {isEditing ? (
                    <Input
                      id="customerName"
                      value={editForm.customerName}
                      onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{selectedBooking.customerName || 'N/A'}</p>
                  )}
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalAmount" className="text-gray-300">Total Amount</Label>
                    {isEditing ? (
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        value={editForm.totalAmount}
                        onChange={(e) => setEditForm({...editForm, totalAmount: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <p className="text-white">{formatCurrency(Number(selectedBooking.totalAmount))}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cashAmount" className="text-gray-300">Cash Amount</Label>
                    {isEditing ? (
                      <Input
                        id="cashAmount"
                        type="number"
                        step="0.01"
                        value={editForm.cashAmount}
                        onChange={(e) => setEditForm({...editForm, cashAmount: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <p className="text-white">{formatCurrency(Number(selectedBooking.cashAmount))}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="upiAmount" className="text-gray-300">UPI Amount</Label>
                    {isEditing ? (
                      <Input
                        id="upiAmount"
                        type="number"
                        step="0.01"
                        value={editForm.upiAmount}
                        onChange={(e) => setEditForm({...editForm, upiAmount: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    ) : (
                      <p className="text-white">{formatCurrency(Number(selectedBooking.upiAmount))}</p>
                    )}
                  </div>
                </div>

                {/* Age Verification */}
                <div>
                  <Label className="text-gray-300">18+ Verification</Label>
                  <div className="mt-2">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant={editForm.isEighteenPlus ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, isEighteenPlus: true, reasonNotEighteen: ""})}
                            className={editForm.isEighteenPlus ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300"}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Yes (18+)
                          </Button>
                          <Button
                            type="button"
                            variant={!editForm.isEighteenPlus ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, isEighteenPlus: false})}
                            className={!editForm.isEighteenPlus ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300"}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            No (Under 18)
                          </Button>
                        </div>
                        {!editForm.isEighteenPlus && (
                          <Textarea
                            placeholder="Reason for under 18 verification..."
                            value={editForm.reasonNotEighteen}
                            onChange={(e) => setEditForm({...editForm, reasonNotEighteen: e.target.value})}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge className={selectedBooking.isEighteenPlus 
                          ? 'bg-green-600/20 text-green-400 border-green-600/30'
                          : 'bg-red-600/20 text-red-400 border-red-600/30'
                        }>
                          {selectedBooking.isEighteenPlus ? 'Yes (18+)' : 'No (Under 18)'}
                        </Badge>
                        {!selectedBooking.isEighteenPlus && selectedBooking.reasonNotEighteen && (
                          <p className="text-gray-400 text-sm">Reason: {selectedBooking.reasonNotEighteen}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visited Status */}
                <div>
                  <Label className="text-gray-300">Visited Status</Label>
                  <div className="mt-2">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex space-x-4">
                          <Button
                            type="button"
                            variant={editForm.visited ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, visited: true, reasonNotVisited: ""})}
                            className={editForm.visited ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300"}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Visited
                          </Button>
                          <Button
                            type="button"
                            variant={!editForm.visited ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, visited: false})}
                            className={!editForm.visited ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-300"}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Not Visited
                          </Button>
                        </div>
                        {!editForm.visited && (
                          <Textarea
                            placeholder="Reason for not visiting..."
                            value={editForm.reasonNotVisited}
                            onChange={(e) => setEditForm({...editForm, reasonNotVisited: e.target.value})}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge className={selectedBooking.visited 
                          ? 'bg-green-600/20 text-green-400 border-green-600/30'
                          : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                        }>
                          {selectedBooking.visited ? 'Visited' : 'Not Visited'}
                        </Badge>
                        {!selectedBooking.visited && selectedBooking.reasonNotVisited && (
                          <p className="text-gray-400 text-sm">Reason: {selectedBooking.reasonNotVisited}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}