package com.enonic.xp.app.applications.rest.resource.application;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import jakarta.annotation.security.RolesAllowed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.enonic.xp.admin.extension.AdminExtensionDescriptor;
import com.enonic.xp.admin.extension.AdminExtensionDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptors;
import com.enonic.xp.api.ApiDescriptorService;
import com.enonic.xp.api.ApiDescriptors;
import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationNotFoundException;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.app.Applications;
import com.enonic.xp.app.applications.ApplicationInfo;
import com.enonic.xp.app.applications.ApplicationInfoService;
import com.enonic.xp.app.applications.rest.resource.ResourceConstants;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationInfoJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ListApplicationJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.CmsFormFragmentServiceResolver;
import com.enonic.xp.app.applications.rest.resource.tool.json.AdminToolDescriptorJson;
import com.enonic.xp.app.applications.rest.resource.tool.json.AdminToolDescriptorsJson;
import com.enonic.xp.descriptor.Descriptors;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.jaxrs.JaxRsComponent;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.schema.content.CmsFormFragmentService;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.CmsDescriptor;
import com.enonic.xp.site.CmsService;
import com.enonic.xp.web.servlet.ServletRequestUrlHelper;

import static com.google.common.base.Strings.isNullOrEmpty;
import static com.google.common.base.Strings.nullToEmpty;
import static java.util.Objects.requireNonNullElseGet;

@Path(ResourceConstants.REST_ROOT + "application")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({RoleKeys.ADMIN_LOGIN_ID, RoleKeys.ADMIN_ID})
@Component(immediate = true, property = "group=v2apps")
public final class AppsApplicationResource
    implements JaxRsComponent
{
    private ApplicationService applicationService;

    private ApplicationDescriptorService applicationDescriptorService;

    private CmsService cmsService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private ApplicationInfoService applicationInfoService;

    private ResourceService resourceService;

    private PortalScriptService portalScriptService;

    private LocaleService localeService;

    private AdminExtensionDescriptorService adminExtensionDescriptorService;

    private AdminToolDescriptorService adminToolDescriptorService;

    private ApiDescriptorService apiDescriptorService;

    private CmsFormFragmentService cmsFormFragmentService;

    private static final ApplicationImageHelper HELPER = new ApplicationImageHelper();

    public AppsApplicationResource()
    {
    }

    @GET
    public ApplicationJson getByKey( @QueryParam("applicationKey") String applicationKey, @Context HttpServletRequest request )
    {
        final ApplicationKey appKey = ApplicationKey.from( applicationKey );
        final Application application = this.applicationService.getInstalledApplication( appKey );

        if ( application == null )
        {
            throw new ApplicationNotFoundException( appKey );
        }

        final boolean local = this.applicationService.isLocalApplication( appKey );
        final CmsDescriptor cmsDescriptor = this.cmsService.getDescriptor( appKey );
        final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( appKey );
        final ApplicationDescriptor appDescriptor = applicationDescriptorService.get( appKey );

        return ApplicationJson.create()
            .setApplication( application )
            .setLocal( local )
            .setApplicationDescriptor( appDescriptor )
            .setCmsDescriptor( cmsDescriptor )
            .setIdProviderDescriptor( idProviderDescriptor )
            .setIconUrlResolver( new ApplicationIconUrlResolver( request ) )
            .setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, appKey, Collections.list( request.getLocales() ) ) )
            .setInlineMixinResolver( new CmsFormFragmentServiceResolver( this.cmsFormFragmentService ) )
            .build();
    }

    @GET
    @Path("list")
    public ListApplicationJson list( @QueryParam("query") final String query, @Context HttpServletRequest request )
        throws Exception
    {
        Applications applications = this.applicationService.getInstalledApplications();

        applications = this.filterApplications( applications, query );

        final List<ApplicationJson> appJsonList = new ArrayList<>();
        for ( final Application application : applications )
        {
            final ApplicationKey applicationKey = application.getKey();
            if ( !application.isSystem() )
            {
                final CmsDescriptor cmsDescriptor = this.cmsService.getDescriptor( applicationKey );
                final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( applicationKey );
                final boolean localApplication = this.applicationService.isLocalApplication( applicationKey );
                final ApplicationDescriptor appDescriptor = this.applicationDescriptorService.get( applicationKey );

                appJsonList.add( ApplicationJson.create()
                                     .setApplication( application )
                                     .setLocal( localApplication )
                                     .setApplicationDescriptor( appDescriptor )
                                     .setCmsDescriptor( cmsDescriptor )
                                     .setIdProviderDescriptor( idProviderDescriptor )
                                     .setIconUrlResolver( new ApplicationIconUrlResolver( request ) )
                                     .setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, applicationKey,
                                                                                           Collections.list( request.getLocales() ) ) )
                                     .setInlineMixinResolver( new CmsFormFragmentServiceResolver( this.cmsFormFragmentService ) )
                                     .build() );
            }
        }

        appJsonList.sort( Comparator.comparing(
            app -> requireNonNullElseGet( app.getTitle(), app::getKey ), String.CASE_INSENSITIVE_ORDER ) );

        final ListApplicationJson json = new ListApplicationJson();
        appJsonList.forEach( json::add );
        return json;
    }

    @GET
    @Path("info")
    public ApplicationInfoJson info( @QueryParam("applicationKey") String key, @Context HttpServletRequest request )
        throws Exception
    {
        final ApplicationKey applicationKey = ApplicationKey.from( key );

        final ApplicationInfo applicationInfo = this.applicationInfoService.getApplicationInfo( applicationKey );
        final Descriptors<AdminExtensionDescriptor> extensionDescriptors =
            this.adminExtensionDescriptorService.getByApplication( applicationKey );
        final AdminToolDescriptors adminToolDescriptors = this.adminToolDescriptorService.getByApplication( applicationKey );
        final ApiDescriptors apiDescriptors = apiDescriptorService.getByApplication( applicationKey );

        final List<AdminToolDescriptorJson> adminTools = adminToolDescriptors.stream()
            .map( adminToolDescriptor -> new AdminToolDescriptorJson( adminToolDescriptor,
                                                                      adminToolDescriptor.getIcon() != null ? new String(
                                                                          adminToolDescriptor.getIcon().toByteArray(),
                                                                          StandardCharsets.UTF_8 ) : null,
                                                                      ServletRequestUrlHelper.createUri( request, "/admin/" +
                                                                          adminToolDescriptor.getApplicationKey() + "/" +
                                                                          adminToolDescriptor.getName() ) ) )
            .toList();

        final ApplicationInfoJson.Builder builder = ApplicationInfoJson.create()
            .setApplicationInfo( applicationInfo )
            .setAdminExtensionDescriptors( extensionDescriptors )
            .setApis( apiDescriptors )
            .setAdminToolDescriptors( new AdminToolDescriptorsJson( adminTools ) )
            .setLocaleMessageResolver(
                new LocaleMessageResolver( this.localeService, applicationKey, Collections.list( request.getLocales() ) ) )
            .setInlineMixinResolver( new CmsFormFragmentServiceResolver( this.cmsFormFragmentService ) );

        final Resource resource = resourceService.getResource( ResourceKey.from( applicationKey, "/webapp/webapp.js" ) );
        if ( resource != null && resource.exists() )
        {
            final ScriptExports exports = portalScriptService.execute( resource.getKey() );

            if ( exports.hasMethod( "get" ) || exports.hasMethod( "post" ) || exports.hasMethod( "head" ) || exports.hasMethod( "all" ) )
            {
                if ( "localhost".equals( request.getServerName() ) )
                {
                    builder.setDeploymentUrl(
                        request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/webapp/" +
                            applicationKey );
                }
                else
                {
                    builder.setDeploymentUrl( "webapp/" + applicationKey );
                }
            }
        }
        return builder.build();
    }

    @GET
    @Path("icon/{appKey}")
    @Produces("image/*")
    public Response getIcon( @PathParam("appKey") final String appKeyStr, @QueryParam("hash") final String hash )
        throws Exception
    {
        final ApplicationKey appKey = ApplicationKey.from( appKeyStr );
        final ApplicationDescriptor appDescriptor = applicationDescriptorService.get( appKey );
        final Icon icon = appDescriptor == null ? null : appDescriptor.getIcon();

        final Response.ResponseBuilder responseBuilder;
        if ( icon == null )
        {
            final Icon defaultAppIcon = HELPER.getDefaultApplicationIcon();
            responseBuilder = Response.ok( defaultAppIcon.asInputStream(), defaultAppIcon.getMimeType() );
            applyMaxAge( Integer.MAX_VALUE, responseBuilder );
        }
        else
        {
            responseBuilder = Response.ok( icon.toByteArray(), icon.getMimeType() );
            if ( !isNullOrEmpty( hash ) )
            {
                applyMaxAge( Integer.MAX_VALUE, responseBuilder );
            }
        }

        return responseBuilder.build();
    }

    private void applyMaxAge( int maxAge, final Response.ResponseBuilder responseBuilder )
    {
        final CacheControl cacheControl = new CacheControl();
        cacheControl.setMaxAge( maxAge );
        responseBuilder.cacheControl( cacheControl );
    }

    private Applications filterApplications( final Applications applications, final String query )
    {
        if ( !nullToEmpty( query ).isBlank() )
        {
            final String queryLowercase = query.toLowerCase();
            return Applications.from( applications.stream()
                                          .filter( application -> {
                                              final ApplicationDescriptor appDescriptor =
                                                  applicationDescriptorService.get( application.getKey() );
                                              if ( appDescriptor != null &&
                                                  ( nullToEmpty( appDescriptor.getTitle() ).toLowerCase().contains( queryLowercase ) ||
                                                      nullToEmpty( appDescriptor.getUrl() ).toLowerCase().contains( queryLowercase ) ||
                                                      nullToEmpty( appDescriptor.getVendorName() ).toLowerCase().contains( queryLowercase ) ||
                                                      nullToEmpty( appDescriptor.getVendorUrl() ).toLowerCase().contains( queryLowercase ) ) )
                                              {
                                                  return true;
                                              }
                                              return nullToEmpty( application.getMaxSystemVersion() ).toLowerCase().contains( queryLowercase ) ||
                                                  nullToEmpty( application.getMinSystemVersion() ).toLowerCase().contains( queryLowercase ) ||
                                                  nullToEmpty( application.getSystemVersion() ).toLowerCase().contains( queryLowercase );
                                          } )
                                          .collect( Collectors.toList() ) );
        }

        return applications;
    }

    @Reference
    public void setApplicationService( final ApplicationService applicationService )
    {
        this.applicationService = applicationService;
    }

    @Reference
    public void setApplicationDescriptorService( final ApplicationDescriptorService applicationDescriptorService )
    {
        this.applicationDescriptorService = applicationDescriptorService;
    }

    @Reference
    public void setCmsService( final CmsService cmsService )
    {
        this.cmsService = cmsService;
    }

    @Reference
    public void setIdProviderDescriptorService( final IdProviderDescriptorService idProviderDescriptorService )
    {
        this.idProviderDescriptorService = idProviderDescriptorService;
    }

    @Reference
    public void setApplicationInfoService( final ApplicationInfoService applicationInfoService )
    {
        this.applicationInfoService = applicationInfoService;
    }

    @Reference
    public void setResourceService( final ResourceService resourceService )
    {
        this.resourceService = resourceService;
    }

    @Reference
    public void setPortalScriptService( final PortalScriptService portalScriptService )
    {
        this.portalScriptService = portalScriptService;
    }

    @Reference
    public void setAdminExtensionDescriptorService( AdminExtensionDescriptorService adminExtensionDescriptorService )
    {
        this.adminExtensionDescriptorService = adminExtensionDescriptorService;
    }

    @Reference
    public void setAdminToolDescriptorService( AdminToolDescriptorService adminToolDescriptorService )
    {
        this.adminToolDescriptorService = adminToolDescriptorService;
    }

    @Reference
    public void setLocaleService( final LocaleService localeService )
    {
        this.localeService = localeService;
    }

    @Reference
    public void setCmsFormFragmentService( final CmsFormFragmentService cmsFormFragmentService )
    {
        this.cmsFormFragmentService = cmsFormFragmentService;
    }

    @Reference
    public void setApiDescriptorService( final ApiDescriptorService apiDescriptorService )
    {
        this.apiDescriptorService = apiDescriptorService;
    }
}

