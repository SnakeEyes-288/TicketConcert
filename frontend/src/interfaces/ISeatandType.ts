// interfaces/ISeatandType.ts
export interface SeatandTypeInterface {
    seat_number: string;
    isAvailable: boolean;
    seatType?: {
      Name: string;
      Description: string;
    };
  }
  