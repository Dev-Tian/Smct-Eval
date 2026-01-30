import { useEffect, useState } from "react";
import Basic_B_View from "./Basic_B_View";
import Basic_HO_View from "./Basic_HO_View";
import RnF_B_View from "./RnF_B_View";
import RnF_HO_View from "./RnF_HO_View";
import apiService from "@/lib/apiService";
import { toastMessages } from "@/lib/toastMessages";

interface viewRouterTypes {
  submission: any;
  isOpen: boolean;
  showApprovalButton: boolean;
  onCloseAction: () => void;
}

export default function ViewDesignator({
  submission,
  isOpen,
  showApprovalButton,
  onCloseAction,
}: viewRouterTypes) {
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    const mount = async () => {
      setEvaluation(submission);
    };
    mount();
  }, []);

  const approved = async (submissionId: number) => {
    const toApprove = async () => {
      try {
        const response = await apiService.approvedByEmployee(submissionId);
        setEvaluation(response.data);
        toastMessages.generic.success("Approved!", "Approved Successfully");
      } catch (error) {
        toastMessages.generic.error("Approval Failed :", `${error}`);
      }
    };
    toApprove();
  };

  return (
    <>
      {submission && submission.evaluationType === "BranchRankNFile" && (
        <RnF_B_View
          isOpen={isOpen}
          onCloseAction={onCloseAction}
          onApprove={(submissionId) => approved(submissionId)}
          submission={evaluation}
          showApprovalButton={showApprovalButton}
        />
      )}

      {submission && submission.evaluationType === "BranchBasic" && (
        <Basic_B_View
          isOpen={isOpen}
          onCloseAction={onCloseAction}
          onApprove={(submissionId) => approved(submissionId)}
          submission={evaluation}
          showApprovalButton={showApprovalButton}
        />
      )}

      {submission && submission.evaluationType === "HoRankNFile" && (
        <RnF_HO_View
          isOpen={isOpen}
          onCloseAction={onCloseAction}
          onApprove={(submissionId) => approved(submissionId)}
          submission={evaluation}
          showApprovalButton={showApprovalButton}
        />
      )}

      {submission && submission.evaluationType === "HoBasic" && (
        <Basic_HO_View
          isOpen={isOpen}
          onCloseAction={onCloseAction}
          onApprove={(submissionId) => approved(submissionId)}
          submission={evaluation}
          showApprovalButton={showApprovalButton}
        />
      )}
    </>
  );
}
