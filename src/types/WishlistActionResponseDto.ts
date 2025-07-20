export interface WishlistActionResponseDto {
    status: string;
    message: string;
    target: {
      type: string; // "class"
      id: number;
    };
  }