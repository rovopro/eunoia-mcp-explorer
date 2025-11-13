import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSource?: {
    id: string;
    name: string;
    type: string;
    credentials: any;
  } | null;
  onSaved: () => void;
}

export function AddDataSourceDialog({ open, onOpenChange, editingSource, onSaved }: AddDataSourceDialogProps) {
  const { toast } = useToast();
  const [dataSourceType, setDataSourceType] = useState<string>(editingSource?.type || "");
  const [name, setName] = useState(editingSource?.name || "");
  const [loading, setLoading] = useState(false);

  // MySQL fields
  const [mysqlHost, setMysqlHost] = useState("");
  const [mysqlPort, setMysqlPort] = useState("");
  const [mysqlDatabase, setMysqlDatabase] = useState("");
  const [mysqlUser, setMysqlUser] = useState("");
  const [mysqlPassword, setMysqlPassword] = useState("");

  // Cosmos DB fields
  const [cosmosUri, setCosmosUri] = useState("");
  const [cosmosKey, setCosmosKey] = useState("");
  const [cosmosDatabase, setCosmosDatabase] = useState("");
  const [cosmosContainer, setCosmosContainer] = useState("");

  // Power BI fields
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [datasetId, setDatasetId] = useState("");

  useEffect(() => {
    if (editingSource) {
      setDataSourceType(editingSource.type);
      setName(editingSource.name);
      const creds = editingSource.credentials;
      
      if (editingSource.type === "mysql") {
        setMysqlHost(creds.host || "");
        setMysqlPort(creds.port || "");
        setMysqlDatabase(creds.database || "");
        setMysqlUser(creds.user || "");
        setMysqlPassword(creds.password || "");
      } else if (editingSource.type === "cosmos") {
        setCosmosUri(creds.uri || "");
        setCosmosKey(creds.key || "");
        setCosmosDatabase(creds.database || "");
        setCosmosContainer(creds.container || "");
      } else if (editingSource.type === "powerbi") {
        setTenantId(creds.tenantId || "");
        setClientId(creds.clientId || "");
        setClientSecret(creds.clientSecret || "");
        setWorkspaceId(creds.workspaceId || "");
        setDatasetId(creds.datasetId || "");
      }
    } else {
      resetForm();
    }
  }, [editingSource, open]);

  const resetForm = () => {
    setDataSourceType("");
    setName("");
    setMysqlHost("");
    setMysqlPort("");
    setMysqlDatabase("");
    setMysqlUser("");
    setMysqlPassword("");
    setCosmosUri("");
    setCosmosKey("");
    setCosmosDatabase("");
    setCosmosContainer("");
    setTenantId("");
    setClientId("");
    setClientSecret("");
    setWorkspaceId("");
    setDatasetId("");
  };

  const handleSave = async () => {
    if (!dataSourceType || !name) {
      toast({
        title: "Error",
        description: "Please select a data source type and enter a name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add a data source",
          variant: "destructive",
        });
        return;
      }

      let credentials = {};

      if (dataSourceType === "mysql") {
        if (!mysqlHost || !mysqlPort || !mysqlDatabase || !mysqlUser || !mysqlPassword) {
          toast({
            title: "Error",
            description: "Please fill in all MySQL fields",
            variant: "destructive",
          });
          return;
        }
        credentials = {
          host: mysqlHost,
          port: mysqlPort,
          database: mysqlDatabase,
          user: mysqlUser,
          password: mysqlPassword,
        };
      } else if (dataSourceType === "cosmos") {
        if (!cosmosUri || !cosmosKey || !cosmosDatabase || !cosmosContainer) {
          toast({
            title: "Error",
            description: "Please fill in all Cosmos DB fields",
            variant: "destructive",
          });
          return;
        }
        credentials = {
          uri: cosmosUri,
          key: cosmosKey,
          database: cosmosDatabase,
          container: cosmosContainer,
        };
      } else if (dataSourceType === "powerbi") {
        if (!tenantId || !clientId || !clientSecret || !workspaceId || !datasetId) {
          toast({
            title: "Error",
            description: "Please fill in all Power BI fields",
            variant: "destructive",
          });
          return;
        }
        credentials = {
          tenantId,
          clientId,
          clientSecret,
          workspaceId,
          datasetId,
        };
      }

      if (editingSource) {
        // Update existing data source
        const { error } = await (supabase as any)
          .from("data_sources")
          .update({
            name,
            type: dataSourceType,
            credentials,
          })
          .eq("id", editingSource.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data source updated successfully",
        });
      } else {
        // Create new data source
        const { error } = await (supabase as any)
          .from("data_sources")
          .insert({
            user_id: user.id,
            name,
            type: dataSourceType,
            credentials,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data source added successfully",
        });
      }

      resetForm();
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editingSource ? "Edit Data Source" : "Add Data Source"}</DialogTitle>
      </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Data Source Name</Label>
            <Input
              id="name"
              placeholder="Enter a name for this data source"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Data Source Type</Label>
            <Select value={dataSourceType} onValueChange={setDataSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="cosmos">Cosmos DB</SelectItem>
                <SelectItem value="powerbi">Power BI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dataSourceType === "mysql" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">MySQL Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="mysql-host">Host</Label>
                <Input
                  id="mysql-host"
                  placeholder="localhost"
                  value={mysqlHost}
                  onChange={(e) => setMysqlHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-port">Port</Label>
                <Input
                  id="mysql-port"
                  placeholder="3306"
                  value={mysqlPort}
                  onChange={(e) => setMysqlPort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-database">Database</Label>
                <Input
                  id="mysql-database"
                  placeholder="database_name"
                  value={mysqlDatabase}
                  onChange={(e) => setMysqlDatabase(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-user">User</Label>
                <Input
                  id="mysql-user"
                  placeholder="username"
                  value={mysqlUser}
                  onChange={(e) => setMysqlUser(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-password">Password</Label>
                <Input
                  id="mysql-password"
                  type="password"
                  placeholder="password"
                  value={mysqlPassword}
                  onChange={(e) => setMysqlPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {dataSourceType === "cosmos" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Cosmos DB Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="cosmos-uri">Endpoint URI</Label>
                <Input
                  id="cosmos-uri"
                  placeholder="https://your-account.documents.azure.com:443/"
                  value={cosmosUri}
                  onChange={(e) => setCosmosUri(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmos-key">Primary Key</Label>
                <Input
                  id="cosmos-key"
                  type="password"
                  placeholder="Your primary key"
                  value={cosmosKey}
                  onChange={(e) => setCosmosKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmos-database">Database</Label>
                <Input
                  id="cosmos-database"
                  placeholder="database_name"
                  value={cosmosDatabase}
                  onChange={(e) => setCosmosDatabase(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmos-container">Container</Label>
                <Input
                  id="cosmos-container"
                  placeholder="container_name"
                  value={cosmosContainer}
                  onChange={(e) => setCosmosContainer(e.target.value)}
                />
              </div>
            </div>
          )}

          {dataSourceType === "powerbi" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Power BI Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="tenant-id">Tenant ID</Label>
                <Input
                  id="tenant-id"
                  placeholder="Your tenant ID"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input
                  id="client-id"
                  placeholder="Your client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-secret">Client Secret</Label>
                <Input
                  id="client-secret"
                  type="password"
                  placeholder="Your client secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-id">Workspace ID</Label>
                <Input
                  id="workspace-id"
                  placeholder="Your workspace ID"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataset-id">Dataset ID</Label>
                <Input
                  id="dataset-id"
                  placeholder="Your dataset ID"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Data Source"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
