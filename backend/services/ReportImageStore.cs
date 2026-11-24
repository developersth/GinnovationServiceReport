using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace backend.Services;

internal static class ReportImageStore
{
    public static async Task<string> SaveAsync(IFormFile file, string webRoot, string folder)
    {
        const long maxBytes = 15 * 1024 * 1024;
        const long maxPixels = 32_000_000;
        const int maxDimension = 1400;

        if (file.Length <= 0 || file.Length > maxBytes)
            throw new InvalidDataException("ไฟล์รูปต้องมีขนาดไม่เกิน 15 MB และมีข้อมูลรูปภาพ");

        try
        {
            using var metadataStream = file.OpenReadStream();
            var info = await Image.IdentifyAsync(metadataStream);
            if ((long)info.Width * info.Height > maxPixels)
                throw new InvalidDataException("รูปภาพมีความละเอียดสูงเกินไป");

            using var stream = file.OpenReadStream();
            using var image = await Image.LoadAsync(new DecoderOptions { MaxFrames = 1 }, stream);
            image.Mutate(context => context.AutoOrient());
            if (Math.Max(image.Width, image.Height) > maxDimension)
            {
                image.Mutate(context => context.Resize(new ResizeOptions
                {
                    Size = new Size(maxDimension, maxDimension),
                    Mode = ResizeMode.Max
                }));
            }

            image.Metadata.ExifProfile = null;
            image.Metadata.IptcProfile = null;
            image.Metadata.XmpProfile = null;

            var jpeg = image.Metadata.DecodedImageFormat == JpegFormat.Instance;
            var fileName = $"{Guid.NewGuid()}{(jpeg ? ".jpg" : ".png")}";
            var directory = Path.Combine(webRoot, "images", folder);
            Directory.CreateDirectory(directory);
            var filePath = Path.Combine(directory, fileName);
            try
            {
                if (jpeg) await image.SaveAsJpegAsync(filePath);
                else await image.SaveAsPngAsync(filePath);
            }
            catch
            {
                File.Delete(filePath);
                throw;
            }

            return $"/images/{folder}/{fileName}";
        }
        catch (UnknownImageFormatException exception)
        {
            throw new InvalidDataException("ไฟล์แนบต้องเป็นรูปภาพที่ระบบรองรับ", exception);
        }
        catch (InvalidImageContentException exception)
        {
            throw new InvalidDataException("ไม่สามารถอ่านไฟล์รูปภาพได้", exception);
        }
    }

    public static void DeleteManagedFile(string? url, string webRoot, string folder, ILogger logger)
    {
        var prefix = $"/images/{folder}/";
        if (url is null || !url.StartsWith(prefix, StringComparison.Ordinal)) return;

        var fileName = url[prefix.Length..];
        var extension = Path.GetExtension(fileName);
        if (fileName.Contains('/') || fileName.Contains('\\') ||
            extension.Length is < 2 or > 6 || !extension[1..].All(char.IsAsciiLetterOrDigit) ||
            !Guid.TryParseExact(Path.GetFileNameWithoutExtension(fileName), "D", out _))
            return;

        try
        {
            File.Delete(Path.Combine(webRoot, "images", folder, fileName));
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            logger.LogWarning(exception, "Could not remove unused image {ImageName}", fileName);
        }
    }
}
