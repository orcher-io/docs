// A saga: undo the completed steps when a later one fails.
import { Saga, isWorkflowSuspension, workflow, type WorkflowContext } from '@orcher/sdk';
import { bookingTasks, type Trip } from './tasks';

// [start:saga]
export const bookTrip = workflow({
  name: 'bookTrip',
  run: async (ctx: WorkflowContext, trip: Trip): Promise<string[]> => {
    const saga = new Saga();
    try {
      // Run a step and, once it succeeds, register what undoes it.
      const hotel = await ctx.executeTask(bookingTasks.bookHotel, trip);
      saga.addCompensation(() => ctx.executeTask(bookingTasks.cancelHotel, hotel));

      const flight = await ctx.executeTask(bookingTasks.bookFlight, trip);
      saga.addCompensation(() => ctx.executeTask(bookingTasks.cancelFlight, flight));

      const charge = await ctx.executeTask(bookingTasks.charge, trip);
      saga.commit();
      return [hotel, flight, charge];
    } catch (err) {
      // Waiting for a task arrives here as a thrown suspension. Re-throw it first,
      // or every healthy run cancels its own bookings.
      if (isWorkflowSuspension(err)) throw err;
      await saga.compensate(); // newest first; a failing compensation is logged and skipped
      throw err;
    }
  },
});
// [end:saga]

// [start:add-step]
export const bookTripSteps = workflow({
  name: 'bookTripSteps',
  run: async (ctx: WorkflowContext, trip: Trip): Promise<string> => {
    const saga = new Saga();
    // addStep runs the action and registers the compensation together. If the
    // action fails it compensates the earlier steps and re-throws; a suspension
    // passes through untouched. Use it when the compensation does not need the
    // action's result.
    await saga.addStep(
      () => ctx.executeTask(bookingTasks.bookHotel, trip),
      () => ctx.executeTask(bookingTasks.cancelHotel, `hotel_${trip.hotelId}`),
    );
    const charge = await saga.addStep(() => ctx.executeTask(bookingTasks.charge, trip));
    saga.commit();
    return charge;
  },
});
// [end:add-step]
