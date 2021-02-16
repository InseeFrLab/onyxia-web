
import { createRouter, defineRoute, param } from "type-route";


export const { RouteProvider, useRoute, routes } = createRouter({
    "home": defineRoute(["/home", "/"]),
    "tour": defineRoute("/visite-guidee"),
    "account": defineRoute("/account"),
    "catalog": defineRoute(
        { "optionalTrailingPath": param.path.trailing.optional.string },
        ({ optionalTrailingPath }) => `/my-lab/catalogue/${optionalTrailingPath}`
    ),
    ...(() => {

        const myServices = defineRoute("/my-service");

        return {
            myServices,
            "myService": myServices.extend(
                { "serviceId": param.path.string },
                ({ serviceId }) => `/${serviceId}`
            )
        };

    })(),
    "mySecrets": defineRoute(
        { "directoryPath": param.path.trailing.optional.string },
        ({ directoryPath }) => `/my-secrets/${directoryPath}`
    ),
    ...(() => {

        const myBuckets = defineRoute("/mes-fichiers");

        return {
            myBuckets,
            "myFiles": myBuckets.extend(
                {
                    "bucketName": param.path.string,
                    "fileOrDirectoryPath": param.path.trailing.optional.string
                },
                ({ bucketName, fileOrDirectoryPath }) => `/${bucketName}/${fileOrDirectoryPath}`
            )
        };


    })()
});
