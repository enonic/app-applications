package com.enonic.xp.app.applications.rest.resource.application;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Locale;

import org.jboss.resteasy.core.ResteasyContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.AdditionalAnswers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.Response;

import com.enonic.xp.admin.extension.AdminExtensionDescriptor;
import com.enonic.xp.admin.extension.AdminExtensionDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptor;
import com.enonic.xp.admin.tool.AdminToolDescriptorService;
import com.enonic.xp.admin.tool.AdminToolDescriptors;
import com.enonic.xp.api.ApiDescriptor;
import com.enonic.xp.api.ApiDescriptorService;
import com.enonic.xp.api.ApiDescriptors;
import com.enonic.xp.app.Application;
import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.app.Applications;
import com.enonic.xp.app.applications.ApplicationInfo;
import com.enonic.xp.app.applications.ApplicationInfoService;
import com.enonic.xp.app.applications.rest.resource.AdminResourceTestSupport;
import com.enonic.xp.descriptor.DescriptorKey;
import com.enonic.xp.descriptor.Descriptors;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.Input;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.page.PageDescriptors;
import com.enonic.xp.portal.script.PortalScriptService;
import com.enonic.xp.region.LayoutDescriptors;
import com.enonic.xp.region.PartDescriptors;
import com.enonic.xp.resource.Resource;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.schema.content.CmsFormFragmentService;
import com.enonic.xp.schema.content.ContentTypes;
import com.enonic.xp.script.ScriptExports;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.site.CmsDescriptor;
import com.enonic.xp.site.CmsService;
import com.enonic.xp.util.Version;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class AppsApplicationResourceTest
    extends AdminResourceTestSupport
{
    private ApplicationService applicationService;

    private ApplicationDescriptorService applicationDescriptorService;

    private ApplicationInfoService applicationInfoService;

    private CmsService cmsService;

    private IdProviderDescriptorService idProviderDescriptorService;

    private AdminExtensionDescriptorService adminExtensionDescriptorService;

    private AdminToolDescriptorService adminToolDescriptorService;

    private ResourceService resourceService;

    private PortalScriptService portalScriptService;

    private LocaleService localeService;

    private CmsFormFragmentService cmsFormFragmentService;

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
        final CmsDescriptor siteDescriptor = createCmsDescriptor( application.getKey() );
        when( this.cmsService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );
        when( cmsFormFragmentService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().path( "application" ).queryParam( "applicationKey", "testapplication" ).get().getAsString();
        assertJson( "get_application_by_key_success.json", response );
    }

    @Test
    public void getApplicationI18n()
        throws Exception
    {
        final Application application = createApplication();
        when( this.applicationService.getInstalledApplication( isA( ApplicationKey.class ) ) ).thenReturn( application );
        final CmsDescriptor siteDescriptor = createCmsDescriptor( application.getKey() );
        when( this.cmsService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
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

        when( cmsFormFragmentService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().path( "application" ).queryParam( "applicationKey", "testapplication" ).get().getAsString();
        assertJson( "get_application_i18n.json", response );
    }

    @Test
    public void getApplicationList()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final CmsDescriptor siteDescriptor = createCmsDescriptor( application.getKey() );
        when( this.cmsService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );
        when( cmsFormFragmentService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().path( "application/list" ).get().getAsString();
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
            .build();

        final ApiDescriptor apiDescriptor1 = ApiDescriptor.create()
            .key( DescriptorKey.from( applicationKey, "myapi1" ) )
            .mount( "xp" )
            .allowedPrincipals( PrincipalKeys.from( RoleKeys.EVERYONE ) )
            .documentationUrl( "url" )
            .description( "description" )
            .title( "displayName1" )
            .build();

        final ApiDescriptor apiDescriptor2 = ApiDescriptor.create()
            .key( DescriptorKey.from( applicationKey, "myapi2" ) )
            .allowedPrincipals( PrincipalKeys.from( RoleKeys.EVERYONE ) )
            .documentationUrl( "url" )
            .description( "description" )
            .title( "displayName2" )
            .build();

        when( apiDescriptorService.getByApplication( applicationKey ) ).thenReturn( ApiDescriptors.from( apiDescriptor1, apiDescriptor2 ) );
        when( this.applicationInfoService.getApplicationInfo( applicationKey ) ).thenReturn( applicationInfo );

        final Resource resource = mock( Resource.class );
        when( resource.exists() ).thenReturn( true );
        when( resource.getKey() ).thenReturn( resourceKey );
        when( this.resourceService.getResource( resourceKey ) ).thenReturn( resource );

        final ScriptExports scriptExports = mock( ScriptExports.class );
        when( scriptExports.hasMethod( "get" ) ).thenReturn( true );
        when( this.portalScriptService.execute( resourceKey ) ).thenReturn( scriptExports );

        when( this.adminExtensionDescriptorService.getByApplication( applicationKey ) ).thenReturn( createAdminExtensionDescriptors() );

        final AdminToolDescriptors adminToolDescriptors = createAdminToolDescriptors();
        when( this.adminToolDescriptorService.getByApplication( applicationKey ) ).thenReturn( adminToolDescriptors );

        final String response = request().path( "application/info" ).queryParam( "applicationKey", "testapplication" ).get().getAsString();

        assertJson( "get_application_info.json", response );
    }

    @Test
    public void getApplicationListWithQuery()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application, createEmptyApplication() );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final CmsDescriptor siteDescriptor = createCmsDescriptor( application.getKey() );
        when( this.cmsService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( ApplicationKey.from( "testapplication" ) ) ).thenReturn( appDescriptor );
        when( cmsFormFragmentService.inlineFormItems( isA( Form.class ) ) ).then( AdditionalAnswers.returnsFirstArg() );

        String response = request().path( "application/list" ).queryParam( "query", "Enonic" ).get().getAsString();
        assertJson( "get_application_list_success.json", response );
    }

    @Test
    public void getApplicationListWithInvalidQuery()
        throws Exception
    {
        final Application application = createApplication();
        final Applications applications = Applications.from( application, createEmptyApplication() );
        when( this.applicationService.getInstalledApplications() ).thenReturn( applications );
        final CmsDescriptor siteDescriptor = createCmsDescriptor( application.getKey() );
        when( this.cmsService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( siteDescriptor );
        final IdProviderDescriptor idProviderDescriptor = createIdProviderDescriptor();
        when( this.idProviderDescriptorService.getDescriptor( isA( ApplicationKey.class ) ) ).thenReturn( idProviderDescriptor );
        final ApplicationDescriptor appDescriptor = createApplicationDescriptor();
        when( this.applicationDescriptorService.get( isA( ApplicationKey.class ) ) ).thenReturn( appDescriptor );

        String response = request().path( "application/list" ).queryParam( "query", "invalid query" ).get().getAsString();
        assertJson( "get_application_list_with_invalid_query.json", response );
    }

    @Test
    public void getIconDefault()
        throws Exception
    {
        String response = request().path( "application/icon/applicationKey" )
            .queryParam( "appKey", "applicationKey" )
            .queryParam( "hash", "123" )
            .get()
            .getDataAsString();

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

        byte[] response = request().path( "application/icon/applicationKey" )
            .queryParam( "appKey", "applicationKey" )
            .queryParam( "hash", "123" )
            .get()
            .getData();

        byte[] expected = icon.toByteArray();

        assertTrue( Arrays.equals( expected, response ) );
    }

    private Application createApplication()
    {
        final Application application = mock( Application.class );
        when( application.getKey() ).thenReturn( ApplicationKey.from( "testapplication" ) );
        when( application.getVersion() ).thenReturn( Version.parseVersion( "1.0.0" ) );
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
        return ApplicationDescriptor.create()
            .key( ApplicationKey.from( "testapplication" ) )
            .description( "Application description" )
            .title( "application display name" )
            .url( "http://enonic.net" )
            .vendorName( "Enonic" )
            .vendorUrl( "https://www.enonic.com" )
            .icon( icon )
            .build();
    }

    private Application createEmptyApplication()
    {
        final Application application = mock( Application.class );
        when( application.getKey() ).thenReturn( ApplicationKey.from( "empty_testapplication" ) );
        return application;
    }

    private CmsDescriptor createCmsDescriptor( final ApplicationKey applicationKey )
    {
        final Form config = Form.create()
            .addFormItem( Input.create()
                              .name( "some-name" )
                              .label( "some-label" )
                              .helpTextI18nKey( "site.config.helpText" )
                              .labelI18nKey( "site.config.label" )
                              .inputType( InputTypeName.TEXT_LINE )
                              .build() )
            .build();

        return CmsDescriptor.create().applicationKey( applicationKey ).form( config ).build();
    }

    private IdProviderDescriptor createIdProviderDescriptor()
    {
        final Form config = Form.create()
            .addFormItem( Input.create()
                              .name( "some-name" )
                              .label( "some-label" )
                              .labelI18nKey( "key.label" )
                              .helpTextI18nKey( "key.help-text" )
                              .inputType( InputTypeName.TEXT_LINE )
                              .build() )
            .build();
        return IdProviderDescriptor.create().config( config ).build();
    }

    private Descriptors<AdminExtensionDescriptor> createAdminExtensionDescriptors()
    {
        final AdminExtensionDescriptor widgetDescriptor1 = AdminExtensionDescriptor.create()
            .title( "My widget" )
            .description( "My widget description" )
            .interfaces( "com.enonic.xp.my-interface", "com.enonic.xp.my-interface-2" )
            .key( DescriptorKey.from( "myapp:my-widget" ) )
            .build();

        return Descriptors.from( widgetDescriptor1 );
    }

    private AdminToolDescriptors createAdminToolDescriptors()
    {
        final AdminToolDescriptor adminToolDescriptor =
            AdminToolDescriptor.create().key( DescriptorKey.from( "myapp:my-tool" ) ).title( "My tool" ).setIcon(
                Icon.from( "icon-source".getBytes( StandardCharsets.UTF_8), "image/svg", Instant.now() )
            ).build();

        return AdminToolDescriptors.from( adminToolDescriptor );
    }

    @Override
    protected Object getResourceInstance()
    {
        this.applicationService = mock( ApplicationService.class );
        this.applicationDescriptorService = mock( ApplicationDescriptorService.class );
        this.applicationInfoService = mock( ApplicationInfoService.class );
        this.cmsService = mock( CmsService.class );
        this.idProviderDescriptorService = mock( IdProviderDescriptorService.class );
        this.resourceService = mock( ResourceService.class );
        this.portalScriptService = mock( PortalScriptService.class );
        this.localeService = mock( LocaleService.class );
        this.adminExtensionDescriptorService = mock( AdminExtensionDescriptorService.class );
        this.adminToolDescriptorService = mock( AdminToolDescriptorService.class );
        this.cmsFormFragmentService = mock( CmsFormFragmentService.class );
        this.apiDescriptorService = mock( ApiDescriptorService.class );

        final AppsApplicationResource resource = new AppsApplicationResource();
        resource.setApplicationService( this.applicationService );
        resource.setCmsService( this.cmsService );
        resource.setIdProviderDescriptorService( this.idProviderDescriptorService );
        resource.setApplicationDescriptorService( this.applicationDescriptorService );
        resource.setApplicationInfoService( this.applicationInfoService );
        resource.setResourceService( this.resourceService );
        resource.setPortalScriptService( this.portalScriptService );
        resource.setLocaleService( this.localeService );
        resource.setAdminExtensionDescriptorService( this.adminExtensionDescriptorService );
        resource.setAdminToolDescriptorService( this.adminToolDescriptorService );
        resource.setCmsFormFragmentService( this.cmsFormFragmentService );
        resource.setApiDescriptorService( this.apiDescriptorService );

        return resource;
    }
}
