import { useCallback, useEffect, useRef, useState } from "react";
import {
  tutorProfileApiClient,
  TutorProfileApiError,
} from "../services/tutor-profile-service";
import type { PublicTutorDetailDto } from "../types";

export type TutorProfileState =
  | { status: "loading" }
  | { status: "success"; tutor: PublicTutorDetailDto }
  | { status: "error"; message: string; isNotFound: boolean };

export interface UseTutorProfileReturn {
  state: TutorProfileState;
  retry: () => void;
}

export function useTutorProfile(tutorId: string): UseTutorProfileReturn {
  const [state, setState] = useState<TutorProfileState>({ status: "loading" });
  const abortRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(
    async (id: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ status: "loading" });

      try {
        const response = await tutorProfileApiClient.getTutorDetail(
          id,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setState({ status: "success", tutor: response.data });
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof TutorProfileApiError) {
          if (err.status === 404) {
            setState({
              status: "error",
              message: "Tutor not found",
              isNotFound: true,
            });
          } else {
            setState({
              status: "error",
              message: err.message,
              isNotFound: false,
            });
          }
        } else {
          setState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
            isNotFound: false,
          });
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (tutorId) {
      fetchProfile(tutorId);
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [tutorId, fetchProfile]);

  const retry = useCallback(() => {
    if (tutorId) {
      fetchProfile(tutorId);
    }
  }, [tutorId, fetchProfile]);

  return { state, retry };
}