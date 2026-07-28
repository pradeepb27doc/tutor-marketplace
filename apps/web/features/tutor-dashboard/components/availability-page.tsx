"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "../../auth/components/auth-provider";
import { useTutorAvailability } from "../hooks/use-tutor-dashboard";
import { useAvailabilityActions } from "../hooks/use-availability-actions";
import { Modal } from "./modal";
import { SlotForm } from "./slot-form";
import { BreakForm } from "./break-form";
import { WeeklySchedule } from "./weekly-schedule";
import { AvailabilitySkeleton } from "./availability-skeleton";
import { ErrorCard } from "./error-card";
import { EmptyState } from "./empty-state";
import type {
  WeeklySlot,
  SlotFormData,
  BreakFormData,
  MutationResult,
} from "../types";

type ModalState =
  | { type: "slot-form"; slot: WeeklySlot | null }
  | { type: "break-form" }
  | { type: "confirm-delete"; itemType: "slot" | "break"; itemId: string; itemName: string }
  | null;

export function AvailabilityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAccessToken, user } = useAuth();
  const token = getAccessToken();

  const { data: availability, loading, error, retry } = useTutorAvailability(token);
  const { createSlot, updateSlot, deleteSlot, createBreak, deleteBreak, isMutating } =
    useAvailabilityActions(token, retry);

  const [modal, setModal] = useState<ModalState>(null);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  const isTutor =
    user && (user.primaryRole === "TUTOR" || user.roles.includes("TUTOR"));
  if (!isTutor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="Not authorized"
          description="This page is available only for tutors."
          action={
            <button
              type="button"
              onClick={() => router.replace("/dashboard")}
              className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to your dashboard
            </button>
          }
        />
      </div>
    );
  }

  const handleSlotSubmit = async (data: SlotFormData): Promise<MutationResult> => {
    if (modal?.type === "slot-form" && modal.slot) {
      return updateSlot(modal.slot.id, data);
    }
    return createSlot(data);
  };

  const handleBreakSubmit = async (data: BreakFormData): Promise<MutationResult> => {
    return createBreak(data);
  };

  const handleConfirmDelete = async () => {
    if (!modal || modal.type !== "confirm-delete") return;
    if (modal.itemType === "slot") {
      await deleteSlot(modal.itemId);
    } else {
      await deleteBreak(modal.itemId);
    }
    setModal(null);
  };

  if (loading) return <AvailabilitySkeleton />;
  if (error) return <ErrorCard title="Availability error" message={error} onRetry={retry} />;

  const hasSlots = availability && availability.weeklySlots.length > 0;
  const hasBreaks = availability && availability.breaks.length > 0;

  if (!hasSlots && !hasBreaks) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="No availability set"
          description="Set your weekly availability to start accepting bookings. You can also add break periods for your lunch or rest time."
          action={
            <button
              type="button"
              onClick={() => setModal({ type: "slot-form", slot: null })}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add your first slot
            </button>
          }
        />
        {modal?.type === "break-form" && (
          <Modal isOpen onClose={() => setModal(null)} title="Add break period" maxWidth="max-w-md">
            <BreakForm
              onSubmit={handleBreakSubmit}
              onCancel={() => setModal(null)}
              isSubmitting={isMutating}
            />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModal({ type: "break-form" })}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Add break
          </button>
          <button
            type="button"
            onClick={() => setModal({ type: "slot-form", slot: null })}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add slot
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Manage your recurring weekly availability. Students will only be able to book during these hours.
      </p>

      {availability ? (
        <WeeklySchedule
          availability={availability}
          onEditSlot={(slot) => setModal({ type: "slot-form", slot })}
          onDeleteSlot={(slot) =>
            setModal({ type: "confirm-delete", itemType: "slot", itemId: slot.id, itemName: "availability slot" })
          }
          onCreateBreak={() => setModal({ type: "break-form" })}
          onDeleteBreak={(b) =>
            setModal({ type: "confirm-delete", itemType: "break", itemId: b.id, itemName: "break period" })
          }
        />
      ) : null}

      {/* Slot form modal */}
      {modal?.type === "slot-form" && (
        <Modal
          isOpen
          onClose={() => setModal(null)}
          title={modal.slot ? "Edit slot" : "Add slot"}
        >
          <SlotForm
            initialData={modal.slot ?? undefined}
            onSubmit={handleSlotSubmit}
            onCancel={() => setModal(null)}
            isSubmitting={isMutating}
          />
        </Modal>
      )}

      {/* Break form modal */}
      {modal?.type === "break-form" && (
        <Modal isOpen onClose={() => setModal(null)} title="Add break period" maxWidth="max-w-md">
          <BreakForm
            onSubmit={handleBreakSubmit}
            onCancel={() => setModal(null)}
            isSubmitting={isMutating}
          />
        </Modal>
      )}

      {/* Confirmation dialog */}
      {modal?.type === "confirm-delete" && (
        <Modal isOpen onClose={() => setModal(null)} title="Confirm deletion" maxWidth="max-w-md">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this {modal.itemName}? This action cannot be undone.
          </p>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AvailabilityPage;
