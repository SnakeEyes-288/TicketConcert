// interfaces/ISeatandType.ts
export interface SeatandTypeInterface {
    SeatNumber: string;
    isAvailable: boolean;
    SeatType?: {
      Name: string;
      Description: string;
    };
  }
  