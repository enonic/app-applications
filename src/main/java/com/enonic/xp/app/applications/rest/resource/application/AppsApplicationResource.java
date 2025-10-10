package com.enonic.xp.app.applications.rest.resource.application;

import java.io.IOException;
import java.net.URL;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.stream.Collectors;

import com.enonic.xp.app.applications.ApplicationInfo;
import com.enonic.xp.app.applications.ApplicationInfoService;
import com.enonic.xp.web.servlet.ServletRequestUrlHelper;
import jakarta.annotation.security.RolesAllowed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.CacheControl;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.ByteSource;
import com.google.common.util.concurrent.Striped;

import com.enonic.xp.admin.tool.AdminToolDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptors;
import com.enonic.xp.admin.widget.WidgetDescriptor;
import com.enonic.xp.admin.widget.WidgetDescriptorService;
import com.enonic.xp.api.ApiDescriptorService;
import com.enonic.xp.api.ApiDescriptors;
import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationNotFoundException;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.app.Applications;
import com.enonic.xp.app.applications.rest.resource.ResourceConstants;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationInfoJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationInstallParams;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationInstallResultJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationInstalledJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationListParams;
import com.enonic.xp.app.applications.rest.resource.application.json.ApplicationSuccessJson;
import com.enonic.xp.app.applications.rest.resource.application.json.ListApplicationJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.InlineMixinResolver;
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
import com.enonic.xp.schema.mixin.MixinService;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.SiteDescriptor;
import com.enonic.xp.site.SiteService;
import com.enonic.xp.util.Exceptions;
import com.enonic.xp.util.HexEncoder;
import com.enonic.xp.web.multipart.MultipartForm;
import com.enonic.xp.web.multipart.MultipartItem;

import static com.google.common.base.Strings.isNullOrEmpty;
import static com.google.common.base.Strings.nullToEmpty;

@Path(ResourceConstants.REST_ROOT + "application")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({RoleKeys.ADMIN_LOGIN_ID, RoleKeys.ADMIN_ID})
@Component(immediate = true, property = "group=v2apps")
public final class AppsApplicationResource
    implements JaxRsComponent
{
    private static final Set<String> ALLOWED_PROTOCOLS = Set.of( "http", "https" );

    private static final Logger LOG = LoggerFactory.getLogger( AppsApplicationResource.class );

    private static final Striped<Lock> LOCK_STRIPED = Striped.lazyWeakLock( 100 );

    private ApplicationService applicationService;

    private ApplicationDescriptorService applicationDescriptorService;

    private SiteService siteService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private ApplicationInfoService applicationInfoService;

    private ResourceService resourceService;

    private PortalScriptService portalScriptService;

    private LocaleService localeService;

    private WidgetDescriptorService widgetDescriptorService;

    private AdminToolDescriptorService adminToolDescriptorService;

    private ApiDescriptorService apiDescriptorService;

    private MixinService mixinService;

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
        final SiteDescriptor siteDescriptor = this.siteService.getDescriptor( appKey );
        final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( appKey );
        final ApplicationDescriptor appDescriptor = applicationDescriptorService.get( appKey );

        return ApplicationJson.create()
            .setApplication( application )
            .setLocal( local )
            .setApplicationDescriptor( appDescriptor )
            .setSiteDescriptor( siteDescriptor )
            .setIdProviderDescriptor( idProviderDescriptor )
            .setIconUrlResolver( new ApplicationIconUrlResolver( request ) )
            .setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, appKey, Collections.list( request.getLocales() ) ) )
            .setInlineMixinResolver( new InlineMixinResolver( this.mixinService ) )
            .build();
    }

    @GET
    @Path("list")
    public ListApplicationJson list( @QueryParam("query") final String query, @Context HttpServletRequest request )
        throws Exception
    {
        Applications applications = this.applicationService.getInstalledApplications();

        applications = this.filterApplications( applications, query );
        applications = this.sortApplications( applications );

        final ListApplicationJson json = new ListApplicationJson();
        for ( final Application application : applications )
        {
            final ApplicationKey applicationKey = application.getKey();
            if ( !application.isSystem() )
            {
                final SiteDescriptor siteDescriptor = this.siteService.getDescriptor( applicationKey );
                final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( applicationKey );
                final boolean localApplication = this.applicationService.isLocalApplication( applicationKey );
                final ApplicationDescriptor appDescriptor = this.applicationDescriptorService.get( applicationKey );

                json.add( ApplicationJson.create()
                              .setApplication( application )
                              .setLocal( localApplication )
                              .setApplicationDescriptor( appDescriptor )
                              .setSiteDescriptor( siteDescriptor )
                              .setIdProviderDescriptor( idProviderDescriptor )
                              .setIconUrlResolver( new ApplicationIconUrlResolver( request ) )
                              .setLocaleMessageResolver( new LocaleMessageResolver( this.localeService, applicationKey,
                                                                                    Collections.list( request.getLocales() ) ) )
                              .setInlineMixinResolver( new InlineMixinResolver( this.mixinService ) )
                              .build() );
            }
        }

        return json;
    }

    @GET
    @Path("info")
    public ApplicationInfoJson info( @QueryParam("applicationKey") String key, @Context HttpServletRequest request )
        throws Exception
    {
        final ApplicationKey applicationKey = ApplicationKey.from( key );

        final ApplicationInfo applicationInfo = this.applicationInfoService.getApplicationInfo( applicationKey );
        final Descriptors<WidgetDescriptor> widgetDescriptors = this.widgetDescriptorService.getByApplication( applicationKey );
        final AdminToolDescriptors adminToolDescriptors = this.adminToolDescriptorService.getByApplication( applicationKey );
        final ApiDescriptors apiDescriptors = apiDescriptorService.getByApplication( applicationKey );

        final AdminToolDescriptorsJson adminToolDescriptorsJson = new AdminToolDescriptorsJson(adminToolDescriptors.stream()
                .map(adminToolDescriptor -> new AdminToolDescriptorJson(
                        adminToolDescriptor,
                        this.adminToolDescriptorService.getIconByKey(adminToolDescriptor.getKey()),
                        ServletRequestUrlHelper.createUri(request, "/admin/" + adminToolDescriptor.getApplicationKey() + "/" + adminToolDescriptor.getName())
                ))
                .collect(Collectors.toList()));

        final ApplicationInfoJson.Builder builder = ApplicationInfoJson.create()
            .setApplicationInfo( applicationInfo )
            .setWidgetDescriptors( widgetDescriptors )
            .setApis( apiDescriptors )
            .setAdminToolDescriptors(adminToolDescriptorsJson).

                setLocaleMessageResolver(
                new LocaleMessageResolver( this.localeService, applicationKey, Collections.list( request.getLocales() ) ) )
            .setInlineMixinResolver( new InlineMixinResolver( this.mixinService ) );

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
    @Path("listKeys")
    public List<String> listKeys( @QueryParam("query") final String query )
    {
        Applications applications = this.applicationService.getInstalledApplications();

        applications = this.filterApplications( applications, query );
        applications = this.sortApplications( applications );

        return applications.stream().filter( app -> !app.isSystem() ).map( app -> app.getKey().toString() ).collect( Collectors.toList() );
    }

    @POST
    @Path("start")
    @RolesAllowed(RoleKeys.ADMIN_ID)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApplicationSuccessJson start( final ApplicationListParams params )
        throws Exception
    {
        params.getKeys().forEach( ( key ) -> lock( key, () -> {
            this.applicationService.startApplication( key, true );
            return null;
        } ) );
        return new ApplicationSuccessJson();
    }

    @POST
    @Path("stop")
    @RolesAllowed(RoleKeys.ADMIN_ID)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApplicationSuccessJson stop( final ApplicationListParams params )
        throws Exception
    {
        params.getKeys().forEach( ( key ) -> lock( key, () -> {
            this.applicationService.stopApplication( key, true );
            return null;
        } ) );
        return new ApplicationSuccessJson();
    }

    @POST
    @Path("install")
    @RolesAllowed(RoleKeys.ADMIN_ID)
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public ApplicationInstallResultJson install( final MultipartForm form, @Context HttpServletRequest request )
        throws Exception
    {
        final MultipartItem appFile = form.get( "file" );

        if ( appFile == null )
        {
            throw new IllegalArgumentException( "Missing file item" );
        }
        if ( appFile.getFileName() == null )
        {
            throw new IllegalArgumentException( "Missing file name" );
        }
        final ByteSource byteSource = appFile.getBytes();

        return lock( appFile.getFileName(), () -> installApplication( byteSource, appFile.getFileName(), request ) );
    }

    @POST
    @Path("uninstall")
    @RolesAllowed(RoleKeys.ADMIN_ID)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApplicationSuccessJson uninstall( final ApplicationListParams params )
        throws Exception
    {
        params.getKeys().forEach( ( key ) -> lock( key, () -> {
            this.applicationService.uninstallApplication( key, true );
            return null;
        } ) );
        return new ApplicationSuccessJson();
    }

    @POST
    @Path("installUrl")
    @RolesAllowed(RoleKeys.ADMIN_ID)
    @Consumes(MediaType.APPLICATION_JSON)
    public ApplicationInstallResultJson installUrl( final ApplicationInstallParams params, @Context HttpServletRequest request )
        throws Exception
    {
        final String urlString = params.getUrl();
        final byte[] sha512 = Optional.ofNullable( params.getSha512() ).map( HexEncoder::fromHex ).orElse( null );
        final ApplicationInstallResultJson result = new ApplicationInstallResultJson();
        String failure;
        try
        {
            final URL url = new URL( urlString );

            if ( ALLOWED_PROTOCOLS.contains( url.getProtocol() ) )
            {
                return lock( url, () -> installApplication( url, sha512, request ) );
            }
            else
            {
                failure = "Illegal protocol: " + url.getProtocol();
                result.setFailure( failure );

                return result;
            }

        }
        catch ( IOException e )
        {
            LOG.error( failure = "Failed to upload application from " + urlString, e );
            result.setFailure( failure );
            return result;
        }
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

    private ApplicationInstallResultJson installApplication( final URL url, final byte[] sha512, HttpServletRequest request )
    {
        final ApplicationInstallResultJson result = new ApplicationInstallResultJson();

        try
        {
            final Application application = this.applicationService.installGlobalApplication( url, sha512 );

            result.setApplicationInstalledJson( new ApplicationInstalledJson( application, false, new ApplicationIconUrlResolver( request ) ) );
        }
        catch ( Exception e )
        {
            final String failure = "Failed to process application from " + url;
            LOG.error( failure, e );

            result.setFailure( failure );
        }
        return result;
    }

    private ApplicationInstallResultJson installApplication( final ByteSource byteSource, final String applicationName, HttpServletRequest request )
    {
        final ApplicationInstallResultJson result = new ApplicationInstallResultJson();

        try
        {
            final Application application = this.applicationService.installGlobalApplication( byteSource, applicationName );

            result.setApplicationInstalledJson( new ApplicationInstalledJson( application, false, new ApplicationIconUrlResolver( request ) ) );
        }
        catch ( Exception e )
        {
            final String failure = "Failed to process application " + applicationName;
            LOG.error( failure, e );

            result.setFailure( failure );
        }
        return result;
    }

    @GET
    @Path("getIdProviderApplication")
    public ApplicationJson getIdProviderApplication( @QueryParam("applicationKey") String key, @Context HttpServletRequest request )
    {
        final ApplicationKey applicationKey = ApplicationKey.from( key );

        final IdProviderDescriptor idProviderDescriptor = this.idProviderDescriptorService.getDescriptor( applicationKey );

        if ( idProviderDescriptor != null )
        {
            final Application application = this.applicationService.getInstalledApplication( applicationKey );
            final boolean localApplication = this.applicationService.isLocalApplication( applicationKey );

            final SiteDescriptor siteDescriptor = this.siteService.getDescriptor( applicationKey );

            final ApplicationDescriptor appDescriptor = applicationDescriptorService.get( applicationKey );
            return ApplicationJson.create()
                .setApplication( application )
                .setLocal( localApplication )
                .setApplicationDescriptor( appDescriptor )
                .setSiteDescriptor( siteDescriptor )
                .setIdProviderDescriptor( idProviderDescriptor )
                .setIconUrlResolver( new ApplicationIconUrlResolver( request ) )
                .setLocaleMessageResolver(
                    new LocaleMessageResolver( this.localeService, applicationKey, Collections.list( request.getLocales() ) ) )
                .setInlineMixinResolver( new InlineMixinResolver( this.mixinService ) )
                .build();
        }
        return null;
    }

    private Applications sortApplications( final Applications applications )
    {
        return Applications.from(
            applications.stream().sorted( Comparator.comparing( Application::getDisplayName ) ).collect( Collectors.toList() ) );
    }

    private Applications filterApplications( final Applications applications, final String query )
    {
        if ( !nullToEmpty( query ).isBlank() )
        {
            final String queryLowercase = query.toLowerCase();
            return Applications.from( applications.stream()
                                          .filter( application -> nullToEmpty( application.getDisplayName() ).toLowerCase()
                                              .contains( queryLowercase ) ||
                                              nullToEmpty( application.getMaxSystemVersion() ).toLowerCase().contains( queryLowercase ) ||
                                              nullToEmpty( application.getMinSystemVersion() ).toLowerCase().contains( queryLowercase ) ||
                                              nullToEmpty( application.getSystemVersion() ).toLowerCase().contains( queryLowercase ) ||
                                              nullToEmpty( application.getUrl() ).toLowerCase().contains( queryLowercase ) ||
                                              nullToEmpty( application.getVendorName() ).toLowerCase().contains( queryLowercase ) ||
                                              nullToEmpty( application.getVendorUrl() ).toLowerCase().contains( queryLowercase ) )
                                          .collect( Collectors.toList() ) );
        }

        return applications;
    }

    private <V> V lock( Object key, Callable<V> callable )
    {
        final Lock lock = LOCK_STRIPED.get( key );
        try
        {
            if ( lock.tryLock( 30, TimeUnit.MINUTES ) )
            {
                try
                {
                    return callable.call();
                }
                catch ( Exception e )
                {
                    throw Exceptions.unchecked( e );
                }
                finally
                {
                    lock.unlock();
                }
            }
            else
            {
                throw new RuntimeException( "Failed to acquire application service lock for application [" + key + "]" );
            }
        }
        catch ( InterruptedException e )
        {
            throw new RuntimeException( "Failed to acquire application service lock for application [" + key + "]", e );
        }
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
    public void setSiteService( final SiteService siteService )
    {
        this.siteService = siteService;
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
    public void setWidgetDescriptorService( WidgetDescriptorService widgetDescriptorService )
    {
        this.widgetDescriptorService = widgetDescriptorService;
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
    public void setMixinService( final MixinService mixinService )
    {
        this.mixinService = mixinService;
    }

    @Reference
    public void setApiDescriptorService( final ApiDescriptorService apiDescriptorService )
    {
        this.apiDescriptorService = apiDescriptorService;
    }
}

