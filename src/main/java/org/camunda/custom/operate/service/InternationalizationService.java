package org.camunda.custom.operate.service;

import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.databind.DatabindException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.PostConstruct;
import org.camunda.custom.operate.jsonmodel.Translation;
import org.camunda.custom.operate.utils.JsonUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class InternationalizationService {

  public static final String TRANSLATIONS = "translations";

  private Map<String, Translation> codeTranslationMap = new HashMap<>();

  @Value("${workspace:workspace}")
  private String workspace;

  public Path resolveTranslation(String name) {
    return Path.of(workspace).resolve(TRANSLATIONS).resolve(name);
  }

  public List<String> findLanguages() {
    return Stream.of(Path.of(workspace).resolve(TRANSLATIONS).toFile().listFiles())
        .map(File::getName)
        .collect(Collectors.toList());
  }

  public Translation findByName(String name)
      throws StreamReadException, DatabindException, IOException {
    return JsonUtils.fromJsonFile(resolveTranslation(name), Translation.class);
  }

  public Translation findByCode(String code) {
    return codeTranslationMap.get(code);
  }

  public Collection<Translation> all() {
    return codeTranslationMap.values();
  }

  public Translation saveTranslation(Translation translation) throws IOException {
    translation.setModified(new Date());
    JsonUtils.toJsonFile(resolveTranslation(translation.getName()), translation);
    codeTranslationMap.put(translation.getCode(), translation);
    return translation;
  }

  public void deleteByName(String name) throws IOException {
    Files.delete(resolveTranslation(name));
  }

  @PostConstruct
  private void loadTranslations() throws IOException {
    File[] lns = Path.of(workspace).resolve(TRANSLATIONS).toFile().listFiles();
    if (lns != null) {
      for (File file : lns) {
        Translation translation = JsonUtils.fromJsonFile(file.toPath(), Translation.class);
        codeTranslationMap.put(translation.getCode(), translation);
      }
    }
  }
}
