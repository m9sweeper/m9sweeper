# M9SweeperApi

All URIs are relative to */*

Method | HTTP request | Description
------------- | ------------- | -------------
[**clusterControllerGetClusterByClusterName**](M9SweeperApi.md#clusterControllerGetClusterByClusterName) | **GET** /api/clusters/by-name/{clusterName} | 
[**clusterControllerGetClusterById**](M9SweeperApi.md#clusterControllerGetClusterById) | **GET** /api/clusters/{clusterId} | 
[**dockerRegistriesControllerGetDockerRegistries**](M9SweeperApi.md#dockerRegistriesControllerGetDockerRegistries) | **GET** /api/docker-registries | 
[**imageControllerCreateImage**](M9SweeperApi.md#imageControllerCreateImage) | **POST** /api/clusters/{clusterId}/images | 
[**imageControllerGetImageByDockerUrl**](M9SweeperApi.md#imageControllerGetImageByDockerUrl) | **GET** /api/clusters/{clusterId}/image-by-docker-url | 
[**imageControllerSaveImageScanResults**](M9SweeperApi.md#imageControllerSaveImageScanResults) | **POST** /api/clusters/{clusterId}/images/{imageId}/trawler/scan/results | 
[**imageControllerSaveImageScanResultsPerPolicy**](M9SweeperApi.md#imageControllerSaveImageScanResultsPerPolicy) | **POST** /api/clusters/{clusterId}/images/{imageId}/trawler/scan/results/per-policy | 
[**policyControllerGetPoliciesByClusterId**](M9SweeperApi.md#policyControllerGetPoliciesByClusterId) | **GET** /api/policies/by-cluster/{clusterId} | 

<a name="clusterControllerGetClusterByClusterName"></a>
# **clusterControllerGetClusterByClusterName**
> ClusterResponse clusterControllerGetClusterByClusterName(clusterName)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
String clusterName = "clusterName_example"; // String | 
try {
    ClusterResponse result = apiInstance.clusterControllerGetClusterByClusterName(clusterName);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#clusterControllerGetClusterByClusterName");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clusterName** | **String**|  |

### Return type

[**ClusterResponse**](ClusterResponse.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="clusterControllerGetClusterById"></a>
# **clusterControllerGetClusterById**
> ClusterResponse clusterControllerGetClusterById(clusterId)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
try {
    ClusterResponse result = apiInstance.clusterControllerGetClusterById(clusterId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#clusterControllerGetClusterById");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clusterId** | **BigDecimal**|  |

### Return type

[**ClusterResponse**](ClusterResponse.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="dockerRegistriesControllerGetDockerRegistries"></a>
# **dockerRegistriesControllerGetDockerRegistries**
> DockerRegistriesResponseDto dockerRegistriesControllerGetDockerRegistries(page, limit, sortBy, sortDirection, loginRequired, authType, url)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
BigDecimal page = new BigDecimal(); // BigDecimal | 
BigDecimal limit = new BigDecimal(); // BigDecimal | 
String sortBy = "sortBy_example"; // String | 
String sortDirection = "sortDirection_example"; // String | 
String loginRequired = "loginRequired_example"; // String | 
String authType = "authType_example"; // String | 
String url = "url_example"; // String | 
try {
    DockerRegistriesResponseDto result = apiInstance.dockerRegistriesControllerGetDockerRegistries(page, limit, sortBy, sortDirection, loginRequired, authType, url);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#dockerRegistriesControllerGetDockerRegistries");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **BigDecimal**|  | [optional]
 **limit** | **BigDecimal**|  | [optional]
 **sortBy** | **String**|  | [optional]
 **sortDirection** | **String**|  | [optional]
 **loginRequired** | **String**|  | [optional]
 **authType** | **String**|  | [optional]
 **url** | **String**|  | [optional]

### Return type

[**DockerRegistriesResponseDto**](DockerRegistriesResponseDto.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="imageControllerCreateImage"></a>
# **imageControllerCreateImage**
> ImageDetailsResponseDto imageControllerCreateImage(body, skipImageScan, clusterId)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
ImageCreateDto body = new ImageCreateDto(); // ImageCreateDto | 
Boolean skipImageScan = true; // Boolean | 
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
try {
    ImageDetailsResponseDto result = apiInstance.imageControllerCreateImage(body, skipImageScan, clusterId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#imageControllerCreateImage");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ImageCreateDto**](ImageCreateDto.md)|  |
 **skipImageScan** | **Boolean**|  |
 **clusterId** | **BigDecimal**|  |

### Return type

[**ImageDetailsResponseDto**](ImageDetailsResponseDto.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="imageControllerGetImageByDockerUrl"></a>
# **imageControllerGetImageByDockerUrl**
> ImageDetailsResponseDto imageControllerGetImageByDockerUrl(clusterId, dockerImageUrl)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
String dockerImageUrl = "dockerImageUrl_example"; // String | 
try {
    ImageDetailsResponseDto result = apiInstance.imageControllerGetImageByDockerUrl(clusterId, dockerImageUrl);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#imageControllerGetImageByDockerUrl");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clusterId** | **BigDecimal**|  |
 **dockerImageUrl** | **String**|  |

### Return type

[**ImageDetailsResponseDto**](ImageDetailsResponseDto.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="imageControllerSaveImageScanResults"></a>
# **imageControllerSaveImageScanResults**
> ImageScanResultSaveResponse imageControllerSaveImageScanResults(body, clusterId, imageId)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
TrawlerScanResults body = new TrawlerScanResults(); // TrawlerScanResults | 
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
BigDecimal imageId = new BigDecimal(); // BigDecimal | 
try {
    ImageScanResultSaveResponse result = apiInstance.imageControllerSaveImageScanResults(body, clusterId, imageId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#imageControllerSaveImageScanResults");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**TrawlerScanResults**](TrawlerScanResults.md)|  |
 **clusterId** | **BigDecimal**|  |
 **imageId** | **BigDecimal**|  |

### Return type

[**ImageScanResultSaveResponse**](ImageScanResultSaveResponse.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="imageControllerSaveImageScanResultsPerPolicy"></a>
# **imageControllerSaveImageScanResultsPerPolicy**
> ImageScanResultSaveResponse imageControllerSaveImageScanResultsPerPolicy(body, clusterId, imageId)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
ImageTrawlerResultDto body = new ImageTrawlerResultDto(); // ImageTrawlerResultDto | 
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
BigDecimal imageId = new BigDecimal(); // BigDecimal | 
try {
    ImageScanResultSaveResponse result = apiInstance.imageControllerSaveImageScanResultsPerPolicy(body, clusterId, imageId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#imageControllerSaveImageScanResultsPerPolicy");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**ImageTrawlerResultDto**](ImageTrawlerResultDto.md)|  |
 **clusterId** | **BigDecimal**|  |
 **imageId** | **BigDecimal**|  |

### Return type

[**ImageScanResultSaveResponse**](ImageScanResultSaveResponse.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="policyControllerGetPoliciesByClusterId"></a>
# **policyControllerGetPoliciesByClusterId**
> PoliciesByClusterResponse policyControllerGetPoliciesByClusterId(clusterId)



### Example
```java
// Import classes:
//import io.m9sweeper.trawler.framework.client.handler.ApiClient;
//import io.m9sweeper.trawler.framework.client.handler.ApiException;
//import io.m9sweeper.trawler.framework.client.handler.Configuration;
//import io.m9sweeper.trawler.framework.client.handler.auth.*;
//import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;

ApiClient defaultClient = Configuration.getDefaultApiClient();

// Configure API key authorization: x-auth-token
ApiKeyAuth x-auth-token = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
x-auth-token.setApiKey("YOUR API KEY");
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//x-auth-token.setApiKeyPrefix("Token");

M9SweeperApi apiInstance = new M9SweeperApi();
BigDecimal clusterId = new BigDecimal(); // BigDecimal | 
try {
    PoliciesByClusterResponse result = apiInstance.policyControllerGetPoliciesByClusterId(clusterId);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling M9SweeperApi#policyControllerGetPoliciesByClusterId");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **clusterId** | **BigDecimal**|  |

### Return type

[**PoliciesByClusterResponse**](PoliciesByClusterResponse.md)

### Authorization

[x-auth-token](../README.md#x-auth-token)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

