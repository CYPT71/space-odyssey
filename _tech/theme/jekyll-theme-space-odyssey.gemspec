Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-space-odyssey"
  spec.version       = "0.1.0"
  spec.authors       = ["CYPT71"]
  spec.email         = ["contacts@cyprientaib.com"]
  spec.summary       = "Space Odyssey terminal flight theme for Jekyll"
  spec.homepage      = "https://cypt71.github.io/space-odyssey"
  spec.license       = "MIT"

  spec.files = Dir.chdir(__dir__) do
    Dir.glob("{_layouts,_includes,assets}/**/*", File::FNM_DOTMATCH)
       .reject { |f| File.directory?(f) }
       .concat(%w[README.md DOCS.md])
  end

  spec.add_runtime_dependency "jekyll", ">= 4.3", "< 5.0"
  spec.add_runtime_dependency "jekyll-sass-converter", ">= 3.0"

  spec.metadata["jekyll-theme"] = spec.name
  spec.metadata["source_code_uri"] = spec.homepage
end
