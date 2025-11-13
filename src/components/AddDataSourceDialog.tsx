import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadButton } from "@/components/FileUploadButton";
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

  // Text Data fields
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
      } else if (editingSource.type === "textdata") {
        setUploadedFiles(creds.files || []);
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
    setUploadedFiles([]);
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
      let credentials = {};

      if (dataSourceType === "mysql") {
        if (!mysqlHost || !mysqlPort || !mysqlDatabase || !mysqlUser || !mysqlPassword) {
          toast({
            title: "Error",
            description: "Please fill in all MySQL fields",
            variant: "destructive",
          });
          setLoading(false);
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
          setLoading(false);
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
          setLoading(false);
          return;
        }
        credentials = {
          tenantId,
          clientId,
          clientSecret,
          workspaceId,
          datasetId,
        };
      } else if (dataSourceType === "textdata") {
        if (uploadedFiles.length === 0) {
          toast({
            title: "Error",
            description: "Please upload at least one PDF file",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        // Convert files to base64 for storage
        const filePromises = uploadedFiles.map(file => 
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              data: reader.result
            });
            reader.readAsDataURL(file);
          })
        );
        const filesData = await Promise.all(filePromises);
        credentials = { files: filesData };
      }

      const existingDataSources = JSON.parse(localStorage.getItem("dataSources") || "[]");

      if (editingSource) {
        // Update existing data source
        const updatedDataSources = existingDataSources.map((ds: any) =>
          ds.id === editingSource.id
            ? { ...ds, name, type: dataSourceType, credentials }
            : ds
        );
        localStorage.setItem("dataSources", JSON.stringify(updatedDataSources));

        toast({
          title: "Success",
          description: "Data source updated successfully",
        });
      } else {
        // Create new data source
        const newDataSource = {
          id: crypto.randomUUID(),
          name,
          type: dataSourceType,
          credentials,
          created_at: new Date().toISOString(),
          isEnabled: true,
        };

        const updatedDataSources = [...existingDataSources, newDataSource];
        localStorage.setItem("dataSources", JSON.stringify(updatedDataSources));

        toast({
          title: "Success",
          description: "Data source added successfully",
        });
      }

      onSaved();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save data source",
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Database"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Data Source Type</Label>
            <Select value={dataSourceType} onValueChange={setDataSourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="cosmos">Azure Cosmos DB</SelectItem>
                <SelectItem value="powerbi">Power BI</SelectItem>
                <SelectItem value="textdata">Text Data (PDF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dataSourceType === "mysql" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mysqlHost">Host</Label>
                <Input
                  id="mysqlHost"
                  value={mysqlHost}
                  onChange={(e) => setMysqlHost(e.target.value)}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysqlPort">Port</Label>
                <Input
                  id="mysqlPort"
                  value={mysqlPort}
                  onChange={(e) => setMysqlPort(e.target.value)}
                  placeholder="3306"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysqlDatabase">Database</Label>
                <Input
                  id="mysqlDatabase"
                  value={mysqlDatabase}
                  onChange={(e) => setMysqlDatabase(e.target.value)}
                  placeholder="my_database"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysqlUser">User</Label>
                <Input
                  id="mysqlUser"
                  value={mysqlUser}
                  onChange={(e) => setMysqlUser(e.target.value)}
                  placeholder="root"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysqlPassword">Password</Label>
                <Input
                  id="mysqlPassword"
                  type="password"
                  value={mysqlPassword}
                  onChange={(e) => setMysqlPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {dataSourceType === "cosmos" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cosmosUri">Cosmos DB URI</Label>
                <Input
                  id="cosmosUri"
                  value={cosmosUri}
                  onChange={(e) => setCosmosUri(e.target.value)}
                  placeholder="https://your-account.documents.azure.com:443/"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmosKey">Primary Key</Label>
                <Input
                  id="cosmosKey"
                  type="password"
                  value={cosmosKey}
                  onChange={(e) => setCosmosKey(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmosDatabase">Database</Label>
                <Input
                  id="cosmosDatabase"
                  value={cosmosDatabase}
                  onChange={(e) => setCosmosDatabase(e.target.value)}
                  placeholder="your-database"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cosmosContainer">Container</Label>
                <Input
                  id="cosmosContainer"
                  value={cosmosContainer}
                  onChange={(e) => setCosmosContainer(e.target.value)}
                  placeholder="your-container"
                />
              </div>
            </>
          )}

          {dataSourceType === "powerbi" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="your-tenant-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="your-client-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspaceId">Workspace ID</Label>
                <Input
                  id="workspaceId"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  placeholder="your-workspace-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="datasetId">Dataset ID</Label>
                <Input
                  id="datasetId"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  placeholder="your-dataset-id"
                />
              </div>
            </>
          )}

          {dataSourceType === "textdata" && (
            <div className="space-y-2">
              <Label>Upload PDF Files</Label>
              <div className="flex items-center gap-2">
                <FileUploadButton onFileSelect={(file) => {
                  if (file.type === "application/pdf") {
                    setUploadedFiles([...uploadedFiles, file]);
                  } else {
                    toast({
                      title: "Invalid file type",
                      description: "Please upload PDF files only",
                      variant: "destructive",
                    });
                  }
                }} />
                <span className="text-sm text-muted-foreground">
                  {uploadedFiles.length} file(s) uploaded
                </span>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-1 mt-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="text-sm flex items-center justify-between bg-muted p-2 rounded">
                      <span>{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : editingSource ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
