$generatedDir = "generated"
if (-Not (Test-Path -Path $generatedDir)) {
    New-Item -ItemType Directory -Path $generatedDir
}

$protocGenTsPath = Join-Path $PWD "node_modules/.bin/protoc-gen-ts_proto.cmd"

grpc_tools_node_protoc `
--plugin=protoc-gen-ts_proto=$protocGenTsPath `
--ts_proto_out=./generated `
--ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true,useExactTypes=false,exportCommonSymbols=false,esModuleInterop=true `
-I ./proto `
./proto/input_service.proto

grpc_tools_node_protoc `
--plugin=protoc-gen-ts_proto=$protocGenTsPath `
--ts_proto_out=./generated `
--ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true,useExactTypes=false,exportCommonSymbols=false,esModuleInterop=true `
-I ./proto `
./proto/restart_service.proto

grpc_tools_node_protoc `
--plugin=protoc-gen-ts_proto=$protocGenTsPath `
--ts_proto_out=./generated `
--ts_proto_opt=outputServices=grpc-js,env=node,esModuleInterop=true,useExactTypes=false,exportCommonSymbols=false,esModuleInterop=true `
-I ./proto `
./proto/video_service.proto

