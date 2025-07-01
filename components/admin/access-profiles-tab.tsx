import AddAuthorizedCpfForm from "@/components/add-authorized-cpf-form";
import { AuthorizedCpfList } from "@/components/authorized-cpf-list";
import { IPlayer } from "@/models/player-model";

interface AccessProfilesTabProps {
  authorizedPlayers: IPlayer[];
}

export function AccessProfilesTab({ authorizedPlayers }: AccessProfilesTabProps) {
  return (
    <>
      <AddAuthorizedCpfForm />
      <div className="mt-6">
        <AuthorizedCpfList initialPlayers={authorizedPlayers} />
      </div>
    </>
  );
}
