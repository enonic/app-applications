package com.enonic.xp.app.applications.rest.resource.application;

import java.net.URL;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

import org.jboss.resteasy.core.ResteasyContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.AdditionalAnswers;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.osgi.framework.Version;

import com.google.common.io.ByteSource;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.enonic.xp.admin.tool.AdminToolDescriptor;
import com.enonic.xp.admin.tool.AdminToolDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptors;
import com.enonic.xp.admin.widget.WidgetDescriptor;
import com.enonic.xp.admin.widget.WidgetDescriptorService;
import com.enonic.xp.api.ApiDescriptor;
import com.enonic.xp.api.ApiDescriptorService;
import com.enonic.xp.api.ApiDescriptors;
import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationInfo;
import com.enonic.xp.app.ApplicationInfoService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.app.Applications;
import com.enonic.xp.app.applications.rest.resource.AdminResourceTestSupport;
import com.enonic.xp.core.impl.app.ApplicationInstallException;
import com.enonic.xp.descriptor.Descriptors;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.Input;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.jaxrs.impl.MockRestResponse;
import com.enonic.xp.descriptor.DescriptorKey;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.page.PageDescriptors;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.region.LayoutDescriptors;
import com.enonic.xp.region.PartDescriptors;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.schema.content.ContentTypes;
import com.enonic.xp.schema.mixin.MixinService;
import com.enonic.xp.schema.relationship.RelationshipTypes;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.SiteDescriptor;
import com.enonic.xp.site.SiteService;
import com.enonic.xp.web.multipart.MultipartForm;
import com.enonic.xp.web.multipart.MultipartItem;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class AppsApplicationResourceTest
    extends AdminResourceTestSupport
{
    private ApplicationService applicationService;

    private ApplicationDescriptorService applicationDescriptorService;

    private ApplicationInfoService applicationInfoService;

    private SiteService siteService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private WidgetDescriptorService widgetDescriptorService;

    private AdminToolDescriptorService adminToolDescriptorService;

    private ResourceService resourceService;

    private PortalScriptService portalScriptService;

    private LocaleService localeService;

    private MixinService mixinService;

    private ApiDescriptorService apiDescriptorService;

    @BeforeEach
    public void setup()
    {
        final HttpServletRequest mockRequest = mock( HttpServletRequest.class );
        when( mockRequest.getServerName() ).thenReturn( "localhost" );
        when( mockRequest.getScheme() ).thenReturn( "http" );
        when( mockRequest.getServerPort() ).thenReturn( 80 );
        when( mockRequest.getLocales() ).thenReturn( Collections.enumeration( Collections.singleton( Locale.US ) ) );
        ResteasyContext.getContextDataMap().put( HttpServletRequest.class, mockRequest );
    }

    @Test
    public void getApplicationByKey()
        throws Exception
    {
        final Application application = createApplication();
        when( this.applicationService.getInstalledApplication( isA( ApplicationKey.class ) ) ).thenReturn( application );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );
        when( mixinService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().
            path( "application" ).
            queryParam( "applicationKey", "testapplication" ).
            get().getAsString();
        assertJson( "get_application_by_key_success.json", response );
    }

    @Test
    public void getApplicationI18n()
        throws Exception
    {
        final Application application = createApplication();
        when( this.applicationService.getInstalledApplication( isA( ApplicationKey.class ) ) ).thenReturn( application );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );

        final MessageBundle messageBundle = mock( MessageBundle.class );
        when( messageBundle.localize( "key.label" ) ).thenReturn( "translated.label" );
        when( messageBundle.localize( "key.help-text" ) ).thenReturn( "translated.helpText" );

        when( messageBundle.localize( "site.config.helpText" ) ).thenReturn( "translated.site.helpText" );
        when( messageBundle.localize( "site.config.label" ) ).thenReturn( "translated.site.label" );

        when( this.localeService.getBundle( any(), any() ) ).thenReturn( messageBundle );

        when( mixinService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().
            path( "application" ).
            queryParam( "applicationKey", "testapplication" ).
            get().getAsString();
        assertJson( "get_application_i18n.json", response );
    }

    @Test
    public void getApplicationList()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );
        when( mixinService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().
            path( "application/list" ).
            get().getAsString();
        assertJson( "get_application_list_success.json", response );
    }

    @Test
    public void getApplicationInfo()
        throws Exception
    {
        final ApplicationKey applicationKey = createApplication().getKey();
        final ResourceKey resourceKey = ResourceKey.from( applicationKey, "/webapp/webapp.js" );

        final ApplicationInfo applicationInfo = ApplicationInfo.create()
            .setPages( PageDescriptors.empty() )
            .setParts( PartDescriptors.empty() )
            .setLayouts( LayoutDescriptors.empty() )
            .setContentTypes( ContentTypes.empty() )
            .setMacros( MacroDescriptors.empty() )
            .setRelations( RelationshipTypes.empty() )
            .build();

        final ApiDescriptor apiDescriptor1 =
            ApiDescriptor.create().key( DescriptorKey.from( applicationKey, "myapi1" ) ).mount( true ).allowedPrincipals(
                PrincipalKeys.from( RoleKeys.EVERYONE ) ).documentationUrl( "url" ).description( "description" ).displayName(
                "displayName1" ).build();

        final ApiDescriptor apiDescriptor2 =
            ApiDescriptor.create().key( DescriptorKey.from( applicationKey, "myapi2" ) ).mount( false ).allowedPrincipals(
                PrincipalKeys.from( RoleKeys.EVERYONE ) ).documentationUrl( "url" ).description( "description" ).displayName(
                "displayName2" ).build();

        when( apiDescriptorService.getByApplication( applicationKey ) ).thenReturn( ApiDescriptors.from( apiDescriptor1, apiDescriptor2 ) );
        when( this.applicationInfoService.getApplicationInfo( applicationKey ) ).thenReturn( applicationInfo );

        final Resource resource = mock( Resource.class );
        when( resource.exists() ).thenReturn( true );
        when( resource.getKey() ).thenReturn( resourceKey );
        when( this.resourceService.getResource( resourceKey ) ).thenReturn( resource );

        final ScriptExports scriptExports = mock( ScriptExports.class );
        when( scriptExports.hasMethod( "get" ) ).thenReturn( true );
        when( this.portalScriptService.execute( resourceKey ) ).thenReturn( scriptExports );

        when( this.widgetDescriptorService.getByApplication( applicationKey ) ).thenReturn( createWidgetDescriptors() );

        final AdminToolDescriptors adminToolDescriptors = createAdminToolDescriptors();
        when( this.adminToolDescriptorService.getByApplication( applicationKey ) ).thenReturn( adminToolDescriptors );

        final String response = request().
            path( "application/info" ).
            queryParam( "applicationKey", "testapplication" ).
            get().getAsString();

        assertJson( "get_application_info.json", response );
    }

    @Test
    public void getApplicationListWithQuery()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application, createEmptyApplication() );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );
        when( mixinService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().
            path( "application/list" ).
            queryParam( "query", "Enonic" ).
            get().getAsString();
        assertJson( "get_application_list_success.json", response );
    }

    @Test
    public void getApplicationListWithInvalidQuery()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application, createEmptyApplication() );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );

        String response = request().
            path( "application/list" ).
            queryParam( "query", "invalid query" ).
            get().getAsString();
        assertJson( "get_application_list_with_invalid_query.json", response );
    }

    @Test
    public void getApplicationKeys()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final SiteDescriptor siteDescriptor = createSiteDescriptor();
        when( this.siteService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );

        String response = request().
            path( "application/listKeys" ).
            get().getAsString();
        assertJson( "get_application_keys_success.json", response );
    }

    @Test
    public void startApplication()
        throws Exception
    {
        request().path( "application/start" ).entity( "{\"key\":[\"testapplication\"]}", MediaType.APPLICATION_JSON_TYPE ).post();

        verify( this.applicationService ).startApplication( ApplicationKey.from( "testapplication" ), true );
    }

    @Test
    public void stopApplication()
        throws Exception
    {
        request().path( "application/stop" ).entity( "{\"key\":[\"testapplication\"]}", MediaType.APPLICATION_JSON_TYPE ).post();

        verify( this.applicationService ).stopApplication( ApplicationKey.from( "testapplication" ), true );
    }

    @Test
    public void getIconDefault()
        throws Exception
    {
        String response = request().
            path( "application/icon/applicationKey" ).
            queryParam( "appKey", "applicationKey" ).
            queryParam( "hash", "123" ).
            get().getDataAsString();

        String expected = (String) Response.ok( readFromFile( "application.svg" ), "image/svg+xml" ).build().getEntity();

        assertEquals( expected, response );
    }

    @Test
    public void getIcon()
        throws Exception
    {
        final Icon icon = Icon.from( new byte[]{0, 1, 2}, "image/png", Instant.now() );

        final ApplicationDescriptor appDescriptor = createApplicationDescriptor( icon );
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );

        byte[] response = request().
            path( "application/icon/applicationKey" ).
            queryParam( "appKey", "applicationKey" ).
            queryParam( "hash", "123" ).
            get().getData();

        byte[] expected = icon.toByteArray();

        assertTrue( Arrays.equals( expected, response ) );
    }

    @Test
    public void installUrlInvalidUrl()
        throws Exception
    {
        String response = request().
            path( "application/installUrl" ).
            entity( "{\"URL\":\"" + "http://enonic.net" + "\"}", MediaType.APPLICATION_JSON_TYPE ).
            post().getAsString();

        assertEquals( "{\"failure\":\"Failed to process application from http://enonic.net\"}",
                                 response );
    }

    @Test
    public void installUrlInvalidProtocol()
        throws Exception
    {
        String response = request().
            path( "application/installUrl" ).
            entity( "{\"URL\":\"" + "inv://enonic.net" + "\"}", MediaType.APPLICATION_JSON_TYPE ).
            post().getAsString();

        assertEquals( "{\"failure\":\"Failed to upload application from inv://enonic.net\"}",
                                 response );
    }

    @Test
    public void installUrlNotAllowedProtocol()
        throws Exception
    {
        String response = request().
            path( "application/installUrl" ).
            entity( "{\"URL\":\"" + "ftp://enonic.net" + "\"}", MediaType.APPLICATION_JSON_TYPE ).
            post().getAsString();

        assertEquals( "{\"failure\":\"Illegal protocol: ftp\"}", response );
    }

    @Test
    public void installUrl()
        throws Exception
    {
        final Application application = createApplication();
        when(
            this.applicationService.installGlobalApplication( ArgumentMatchers.eq( new URL( application.getUrl() ) ), any() ) ).thenReturn(
            application );

        String response = request().path( "application/installUrl" )
            .entity( "{\"URL\":\"" + application.getUrl() + "\"}", MediaType.APPLICATION_JSON_TYPE )
            .post()
            .getAsString();
        ArgumentCaptor<URL> captor = ArgumentCaptor.forClass( URL.class );
        verify( applicationService ).installGlobalApplication( captor.capture(), any() );
        assertEquals( application.getUrl(), captor.getValue().toString() );

        assertJson( "install_url.json", response );
    }

    @Test
    public void testUninstallFailed()
        throws Exception
    {
        final ApplicationKey applicationKey = ApplicationKey.from( "testapplication" );
        doThrow( new ApplicationInstallException( "expectedException" ) )
            .when( this.applicationService )
            .uninstallApplication( applicationKey, true );

        final MockRestResponse post = request().path( "application/uninstall" )
            .entity( "{\"key\":[\"" + applicationKey + "\"]}", MediaType.APPLICATION_JSON_TYPE )
            .post();
        assertEquals( 500, post.getStatus() );
        assertEquals( "expectedException", post.getAsString() );
    }

    @Test
    public void testUninstall()
        throws Exception
    {
        final ApplicationKey applicationKey = ApplicationKey.from( "testapplication" );

        final String response = request().path( "application/uninstall" ).entity( "{\"key\":[\"" + applicationKey + "\"]}",
                                                                                  MediaType.APPLICATION_JSON_TYPE ).post().getAsString();

        assertEquals( "{}", response );
    }

    @Test
    public void testInstallInvalid()
        throws Exception
    {
        final MultipartForm form = mock( MultipartForm.class );

        final MultipartItem file = createItem( "file", 10, "jar", "image/png" );

        when( form.iterator() ).thenReturn( List.of( file ).iterator() );
        when( form.get( "file" ) ).thenReturn( file );
        when( this.multipartService.parse( any() ) ).thenReturn( form );

        when( this.applicationService.installGlobalApplication( file.getBytes(), "file.jar" ) ).thenThrow( new RuntimeException() );

        String response = request().
            path( "application/install" ).entity( new byte[]{0, 1, 2}, MediaType.MULTIPART_FORM_DATA_TYPE ).
            post().getAsString();

        assertEquals( "{\"failure\":\"Failed to process application file.jar\"}", response );
    }

    @Test
    public void testInstall()
        throws Exception
    {

        final MultipartForm form = mock( MultipartForm.class );

        final MultipartItem file = createItem( "file", 10, "jar", "image/png" );

        when( form.iterator() ).thenReturn( List.of( file ).iterator() );
        when( form.get( "file" ) ).thenReturn( file );
        when( this.multipartService.parse( any() ) ).thenReturn( form );

        final Application application = createApplication();

        when( this.applicationService.installGlobalApplication( file.getBytes(), "file.jar" ) ).thenReturn( application );

        String response = request().
            path( "application/install" ).entity( new byte[]{0, 1, 2}, MediaType.MULTIPART_FORM_DATA_TYPE ).
            post().getAsString();

        assertJson( "install_url.json", response );
    }

    private Application createApplication()
    {
        final Application application = mock( Application.class );
        when( application.getKey() ).thenReturn( ApplicationKey.from( "testapplication" ) );
        when( application.getVersion() ).thenReturn( new Version( 1, 0, 0 ) );
        when( application.getDisplayName() ).thenReturn( "application display name" );
        when( application.getUrl() ).thenReturn( "http://enonic.net" );
        when( application.getVendorName() ).thenReturn( "Enonic" );
        when( application.getVendorUrl() ).thenReturn( "https://www.enonic.com" );
        when( application.getMinSystemVersion() ).thenReturn( "5.0" );
        when( application.getMaxSystemVersion() ).thenReturn( "5.1" );
        when( application.isStarted() ).thenReturn( true );
        when( application.getModifiedTime() ).thenReturn( Instant.parse( "2012-01-01T00:00:00.00Z" ) );

        return application;
    }

    private ApplicationDescriptor createApplicationDescriptor()
    {
        return createApplicationDescriptor( null );
    }

    private ApplicationDescriptor createApplicationDescriptor( final Icon icon )
    {
        return ApplicationDescriptor.create().
            key( ApplicationKey.from( "testapplication" ) ).
            description( "Application description" ).
            icon( icon ).
            build();
    }

    private Application createEmptyApplication()
    {
        final Application application = mock( Application.class );
        when( application.getDisplayName() ).thenReturn( "empty name" );
        when( application.getKey() ).thenReturn( ApplicationKey.from( "empty_testapplication" ) );
        return application;
    }

    private SiteDescriptor createSiteDescriptor()
    {
        final Form config = Form.create().
            addFormItem( Input.create().name( "some-name" ).label( "some-label" ).helpTextI18nKey( "site.config.helpText" ).labelI18nKey(
                "site.config.label" ).inputType( InputTypeName.TEXT_LINE ).build() ).
            build();

        return SiteDescriptor.create().form( config ).build();
    }

    private IdProviderDescriptor createIdProviderDescriptor()
    {
        final Form config = Form.create().
            addFormItem( Input.create().name( "some-name" ).label( "some-label" ).labelI18nKey( "key.label" ).helpTextI18nKey(
                "key.help-text" ).inputType( InputTypeName.TEXT_LINE ).build() ).
            build();
        return IdProviderDescriptor.create().
            config( config ).
            build();
    }

    private Descriptors<WidgetDescriptor> createWidgetDescriptors()
    {
        final WidgetDescriptor widgetDescriptor1 = WidgetDescriptor.create().
            displayName( "My widget" ).
            description( "My widget description" ).
            addInterface( "com.enonic.xp.my-interface" ).
            addInterface( "com.enonic.xp.my-interface-2" ).
            key( DescriptorKey.from( "myapp:my-widget" ) ).
            build();

        return Descriptors.from( widgetDescriptor1 );
    }

    private AdminToolDescriptors createAdminToolDescriptors()
    {
        final AdminToolDescriptor adminToolDescriptor = AdminToolDescriptor.create().
            key( DescriptorKey.from( "myapp:my-tool" ) ).
            displayName( "My tool" ).
            build();

        when( this.adminToolDescriptorService.getIconByKey( adminToolDescriptor.getKey() ) ).thenReturn( "icon-source" );

        return AdminToolDescriptors.from( adminToolDescriptor );
    }

    private MultipartItem createItem( final String name, final long size, final String ext, final String type )
    {
        return createItem( name, name, size, ext, type );
    }

    private MultipartItem createItem( final String name, final String fileName, final long size, final String ext, final String type )
    {
        final MultipartItem item = mock( MultipartItem.class );
        when( item.getName() ).thenReturn( name );
        when( item.getFileName() ).thenReturn( fileName + "." + ext );
        when( item.getContentType() ).thenReturn( com.google.common.net.MediaType.parse( type ) );
        when( item.getSize() ).thenReturn( size );
        when( item.getBytes() ).thenReturn( ByteSource.wrap( name.getBytes() ) );
        return item;
    }

    @Override
    protected Object getResourceInstance()
    {
        this.applicationService = mock( ApplicationService.class );
        this.applicationDescriptorService = mock( ApplicationDescriptorService.class );
        this.applicationInfoService = mock( ApplicationInfoService.class );
        this.siteService = mock( SiteService.class );
        this.idProviderDescriptorService = mock( IdProviderDescriptorService.class );
        this.resourceService = mock( ResourceService.class );
        this.portalScriptService = mock( PortalScriptService.class );
        this.localeService = mock( LocaleService.class );
        this.widgetDescriptorService = mock( WidgetDescriptorService.class );
        this.adminToolDescriptorService = mock( AdminToolDescriptorService.class );
        this.mixinService = mock( MixinService.class );
        this.apiDescriptorService = mock( ApiDescriptorService.class );

        final AppsApplicationResource resource = new AppsApplicationResource();
        resource.setApplicationService( this.applicationService );
        resource.setSiteService( this.siteService );
        resource.setIdProviderDescriptorService( this.idProviderDescriptorService );
        resource.setApplicationDescriptorService( this.applicationDescriptorService );
        resource.setApplicationInfoService( this.applicationInfoService );
        resource.setResourceService( this.resourceService );
        resource.setPortalScriptService( this.portalScriptService );
        resource.setLocaleService( this.localeService );
        resource.setWidgetDescriptorService( this.widgetDescriptorService );
        resource.setAdminToolDescriptorService( this.adminToolDescriptorService );
        resource.setMixinService( this.mixinService );
        resource.setApiDescriptorService( this.apiDescriptorService );

        return resource;
    }
}
