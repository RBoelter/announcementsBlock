<div class="pkp_block block_announcements">
    <h1>{translate key="announcement.announcements"}</h1>
    {foreach name=announcements from=$announcementsSidebar item=announcement}
        <div class="block_announcements_article">
            <div class="block_announcements_article_headline">
                <a href="{url router=$smarty.const.ROUTE_PAGE page="announcement" op="view" path=$announcement->getId()}">
                    <h2>{$announcement->getLocalizedTitle()|escape}</h2>
                </a>
            </div>
            <div class="block_announcements_article_date">
                <time class="small font-weight-bold">{$announcement->getDatePosted()|date_format:"%e. %B %Y"}</time>
            </div>
            <div class="block_announcements_article_content">
                {$announcement->getLocalizedDescriptionShort()|strip_unsafe_html|regex_replace:"/(<p>|<p [^>]*>)/":""|regex_replace:"/(<\\/p>)/":"<br />"}
            </div>
        </div>
    {/foreach}
</div>