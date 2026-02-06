import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfilePublic,
  VehicleInspectionPublic,
  VehicleInspectionInput,
  ReportStatus,
  ReviewResult,
  LetterheadInfoPublic,
  UserProfile,
  LetterheadInfo,
} from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfilePublic | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllInspections() {
  const { actor, isFetching } = useActor();

  return useQuery<VehicleInspectionPublic[]>({
    queryKey: ['inspections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInspections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInspectionsByStatus(status: ReportStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<VehicleInspectionPublic[]>({
    queryKey: ['inspections', 'status', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInspectionsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInspection(reportId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<VehicleInspectionPublic | null>({
    queryKey: ['inspection', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return null;
      return actor.getInspection(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useSubmitInspection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VehicleInspectionInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitInspection(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
}

export function useReviewInspection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      comment,
    }: {
      reportId: string;
      status: ReportStatus;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewInspection(reportId, status, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection'] });
    },
  });
}

export function useGetLetterheadInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<LetterheadInfoPublic>({
    queryKey: ['letterheadInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLetterheadInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateLetterheadInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (info: LetterheadInfo) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLetterheadInfo(info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letterheadInfo'] });
    },
  });
}
