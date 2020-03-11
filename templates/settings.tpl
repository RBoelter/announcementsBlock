<script>
    $(function () {ldelim}
        $('#announcementsSettings').pkpHandler('$.pkp.controllers.form.AjaxFormHandler');
        {rdelim});
</script>
<form
        class="pkp_form"
        id="announcementsSettings"
        method="POST"
        action="{url router=$smarty.const.ROUTE_COMPONENT op="manage" category="blocks" plugin=$pluginName verb="settings" save=true}"
>
    <!-- Always add the csrf token to secure your form -->
    {csrf}
    {fbvFormArea}
        {fbvFormSection title="plugins.blocks.announcements.amount" }
            {fbvElement type="text" id="announcementsAmount" value=$announcementsAmount label='plugins.blocks.announcements.amount.desc'}
        {/fbvFormSection}
        {fbvFormSection title="plugins.blocks.announcements.truncateNum"}
            {fbvElement type="text" id="truncateNum" value=$truncateNum label='plugins.blocks.announcements.truncateNum.desc'}
        {/fbvFormSection}
        {fbvFormSection title="plugins.blocks.announcements.textAlign"}
            {fbvElement id="textAlign" type="select" from=$textAlignOptions selected=$textAlign}
        {/fbvFormSection}
    {/fbvFormArea}
    {fbvFormButtons submitText="common.save"}
</form>