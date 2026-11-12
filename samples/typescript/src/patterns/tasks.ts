// Tasks the pattern samples call.
import { Task, Tasks, createTaskRefs, type TaskContext } from '@orcher/sdk';

export interface Trip {
  tripId: string;
  hotelId: string;
  flightId: string;
  amount: number;
}

@Tasks()
export class BookingTasks {
  @Task()
  async bookHotel(_ctx: TaskContext, trip: Trip): Promise<string> {
    // Call the hotel API here, with trip.tripId as the idempotency key.
    return `hotel_${trip.hotelId}`;
  }

  @Task()
  async cancelHotel(_ctx: TaskContext, bookingId: string): Promise<void> {
    // Call the hotel API here.
    console.log(`canceled ${bookingId}`);
  }

  @Task()
  async bookFlight(_ctx: TaskContext, trip: Trip): Promise<string> {
    // Call the airline API here.
    return `flight_${trip.flightId}`;
  }

  @Task()
  async cancelFlight(_ctx: TaskContext, bookingId: string): Promise<void> {
    // Call the airline API here.
    console.log(`canceled ${bookingId}`);
  }

  @Task()
  async charge(_ctx: TaskContext, trip: Trip): Promise<string> {
    // Call your payment provider here.
    return `ch_${trip.tripId}`;
  }

  @Task()
  async refund(_ctx: TaskContext, chargeId: string): Promise<void> {
    // Call your payment provider here.
    console.log(`refunded ${chargeId}`);
  }
}

export const bookingTasks = createTaskRefs(BookingTasks);

@Tasks()
export class WorkTasks {
  @Task()
  async fetchPrice(_ctx: TaskContext, sku: string): Promise<number> {
    // Look the price up here.
    return sku.length * 100;
  }

  @Task()
  async processBatch(_ctx: TaskContext, batch: { items: string[] }): Promise<number> {
    // Process the whole batch in one task.
    return batch.items.length;
  }

  @Task()
  async notifyApprover(_ctx: TaskContext, requestId: string): Promise<void> {
    // Send the approval request here.
    console.log(`approval requested for ${requestId}`);
  }

  @Task()
  async escalate(_ctx: TaskContext, requestId: string): Promise<void> {
    // Page the approver's manager here.
    console.log(`escalated ${requestId}`);
  }
}

export const workTasks = createTaskRefs(WorkTasks);
