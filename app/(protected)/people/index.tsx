import { PeopleDirectory } from "./_components/people-directory"
// import { ProspectDirectory } from "./_components/prospect-directory";
import { ProspectDirectory } from "./_components/prospect-directory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PeopleList() {
  return (
    <Tabs defaultValue="people-directory" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="people-directory">People Directory</TabsTrigger>
        <TabsTrigger value="prospects">Prospects</TabsTrigger>
      </TabsList>
            
            <TabsContent value="people-directory" className="space-y-4">
              <PeopleDirectory />
            </TabsContent>

            <TabsContent value="prospects" className="space-y-4">
              <ProspectDirectory />
            </TabsContent>
          </Tabs>
  )
}