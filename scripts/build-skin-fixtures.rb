require "jekyll"

root = File.expand_path("..", __dir__)
catalog = File.join(root, "_includes/skins/catalog.html")
skins = File.readlines(catalog, chomp: true).map { |line| line.split("|").first }
preview_path = "/chulapa2/test/skins"
fixture_pages = %w[test/auto-themer/skin.html test/headers/hero.md]

skins.each do |skin|
  config = Jekyll.configuration(
    "config" => %w[_config.yml test/_config.yml].map { |file| File.join(root, file) },
    "source" => root,
    "destination" => File.join(root, "_site_test", "test", "skins", skin),
    "baseurl" => "#{preview_path}/#{skin}",
    "skin_preview_path" => preview_path,
    "chulapa-skin" => { "skin" => skin, "use-dual-mode" => true },
    "color-mode-selector" => true,
    "unpublished" => true,
    "quiet" => true
  )
  site = Jekyll::Site.new(config)
  site.read
  site.pages.select! { |page| fixture_pages.include?(page.path) || page.path.start_with?("assets/") }
  site.pages.find { |page| page.path == "test/auto-themer/skin.html" }.data["permalink"] = "/"
  site.static_files.select! { |file| file.relative_path.start_with?("/assets/") }
  site.docs_to_write.clear
  site.render
  site.cleanup
  # Each skin writes the same source assets to a different destination.
  Jekyll::StaticFile.reset_cache
  site.write
end
